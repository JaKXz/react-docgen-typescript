import * as ts from "typescript";
import type { ParserOptions } from "./";
import { Parser } from "./";
import { fileToDocumentList } from "./generateDocuments";
import type { ComponentDoc } from "./types";

import { nonNull } from "./utilities";

const pathToSourceFile = (program: ts.Program) => (filePath: string) =>
  program.getSourceFile(filePath);

const hasDifferentDisplayName =
  (outerComp: ComponentDoc) => (innerComp: ComponentDoc) =>
    innerComp.displayName !== outerComp.displayName;

const duplicateDocuments = (
  comp: ComponentDoc,
  index: number,
  comps: ComponentDoc[]
) => comps.slice(index + 1).every(hasDifferentDisplayName(comp));

export function parseWithProgramProvider(
  filePathOrPaths: string | string[],
  compilerOptions: ts.CompilerOptions,
  parserOpts: ParserOptions,
  programProvider?: () => ts.Program
): ComponentDoc[] {
  const filePaths = Array.isArray(filePathOrPaths)
    ? filePathOrPaths
    : [filePathOrPaths];

  const program = programProvider
    ? programProvider()
    : ts.createProgram(filePaths, compilerOptions);

  const parser = new Parser(program, parserOpts);

  return filePaths
    .map(pathToSourceFile(program))
    .filter(nonNull)
    .reduce<ComponentDoc[]>(
      fileToDocumentList(parser, parserOpts, program.getTypeChecker()),
      []
    )
    .filter(duplicateDocuments);
}
