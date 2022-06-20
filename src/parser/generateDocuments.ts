import * as ts from "typescript";
import type { ParserOptions } from "./";
import { iterateSymbolTable } from "./utilities";
import { ComponentDoc } from "./types";
import { Parser } from "./";

export const fileToDocumentList =
  (parser: Parser, parserOpts: ParserOptions, checker: ts.TypeChecker) =>
  (acc: ComponentDoc[], sourceFile: ts.SourceFile) => {
    const moduleSymbol = checker.getSymbolAtLocation(sourceFile);
    if (!moduleSymbol) {
      return acc;
    }

    const components = checker.getExportsOfModule(moduleSymbol);
    const componentDocs: ComponentDoc[] = [];

    // First document all components
    components.forEach((exp) => {
      const doc = parser.getComponentInfo(
        exp,
        sourceFile,
        parserOpts.componentNameResolver,
        parserOpts.customComponentTypes
      );

      if (doc) {
        componentDocs.push(doc);
      }

      // Then document any static sub-components
      iterateSymbolTable<ComponentDoc>(exp.exports, (symbol) => {
        if (symbol.flags & ts.SymbolFlags.Prototype) {
          return null;
        }

        if (symbol.flags & ts.SymbolFlags.Method) {
          const signature = parser.getCallSignature(symbol);
          const returnType = checker.typeToString(signature.getReturnType());

          if (returnType !== "Element") {
            return null;
          }
        }

        const doc = parser.getComponentInfo(
          symbol,
          sourceFile,
          parserOpts.componentNameResolver,
          parserOpts.customComponentTypes
        );

        if (doc) {
          const prefix =
            exp.escapedName === "default" ? "" : `${exp.escapedName}.`;

          componentDocs.push({
            ...doc,
            displayName: `${prefix}${symbol.escapedName}`,
          });
        }

        return null;
      });
    });

    return [...acc, ...componentDocs];
  };
