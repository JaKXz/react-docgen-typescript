import * as path from "path";
import { assert } from "vitest";
import { isEqual } from "lodash";
import { parse } from "../parser";
import type { ParserOptions } from "../parser";
import type { ComponentDoc } from "../parser/types";

export interface ExpectedComponents {
  [key: string]: ExpectedComponent;
}

export interface ExpectedComponent {
  [key: string]: ExpectedProp;
}

export interface ExpectedProp {
  type: string;
  required?: boolean;
  description?: string;
  defaultValue?: string | number | boolean | null | undefined;
  parent?: {
    name: string;
    fileName: string;
  };
  raw?: string;
  value?: any;
  tags?: {
    [key: string]: string;
  };
}

export function fixturePath(componentName: string) {
  return path.join(
    __dirname,
    "..",
    "..",
    "src",
    "__tests__",
    "data",
    `${componentName}.tsx`
  ); // it's running in ./temp
}

export function check(
  componentName: string,
  expected: ExpectedComponents,
  exactProperties = true,
  description?: string | null,
  parserOpts?: ParserOptions
) {
  const result = parse(fixturePath(componentName), parserOpts);
  checkComponent(result, expected, exactProperties, description);
}

export function checkComponent(
  actual: ComponentDoc[],
  expected: ExpectedComponents,
  exactProperties = true,
  description?: string | null
) {
  const expectedComponentNames = Object.getOwnPropertyNames(expected);
  assert.equal(
    actual.length,
    expectedComponentNames.length,
    `The number of expected components is different - \r\nexpected: ${expectedComponentNames}, \r\nactual: ${actual.map(
      (i) => i.displayName
    )}`
  );

  const errors: string[] = [];
  for (const expectedComponentName of expectedComponentNames) {
    const expectedComponent = expected[expectedComponentName];
    const componentDocs = actual.filter(
      (i) => i.displayName === expectedComponentName
    );
    if (componentDocs.length === 0) {
      errors.push(`Component is missing - ${expectedComponentName}`);
      continue;
    }
    const componentDoc = componentDocs[0];
    const expectedPropNames = Object.getOwnPropertyNames(expectedComponent);
    const propNames = Object.getOwnPropertyNames(componentDoc.props);
    const compName = componentDoc.displayName;

    let expectedComponentDescription = `${compName} description`;
    if (description !== undefined) {
      expectedComponentDescription = description || "";
    }

    if (componentDoc.description !== expectedComponentDescription) {
      errors.push(
        `${compName} description is different - expected: '${expectedComponentDescription}', actual: '${componentDoc.description}'`
      );
    }

    if (propNames.length !== expectedPropNames.length && exactProperties) {
      errors.push(
        `Properties for ${compName} are different - expected: ${
          expectedPropNames.length
        }, actual: ${propNames.length} (${JSON.stringify(
          expectedPropNames
        )}, ${JSON.stringify(propNames)})`
      );
    }

    for (const expectedPropName of expectedPropNames) {
      const expectedProp = expectedComponent[expectedPropName];
      const prop = componentDoc.props[expectedPropName];
      if (prop === undefined) {
        errors.push(`Property '${compName}.${expectedPropName}' is missing`);
      } else {
        if (expectedProp.type !== prop.type.name) {
          errors.push(
            `Property '${compName}.${expectedPropName}' type is different - expected: ${expectedProp.type}, actual: ${prop.type.name}`
          );
        }
        const expectedDescription =
          expectedProp.description === undefined
            ? `${expectedPropName} description`
            : expectedProp.description;
        if (expectedDescription !== prop.description) {
          errors.push(
            `Property '${compName}.${expectedPropName}' description is different - expected: ${expectedDescription}, actual: ${prop.description}`
          );
        }
        const expectedParentFileName = expectedProp.parent
          ? expectedProp.parent.fileName
          : undefined;
        if (
          expectedParentFileName &&
          prop.parent &&
          expectedParentFileName !== prop.parent.fileName
        ) {
          errors.push(
            `Property '${compName}.${expectedPropName}' parent fileName is different - expected: ${expectedParentFileName}, actual: ${prop.parent.fileName}`
          );
        }
        const expectedRequired =
          expectedProp.required === undefined ? true : expectedProp.required;
        if (expectedRequired !== prop.required) {
          errors.push(
            `Property '${compName}.${expectedPropName}' required is different - expected: ${expectedRequired}, actual: ${prop.required}`
          );
        }
        const expectedDefaultValue = expectedProp.defaultValue;
        const actualDefaultValue = prop.defaultValue
          ? prop.defaultValue.value
          : prop.defaultValue;
        if (
          expectedDefaultValue &&
          expectedDefaultValue !== actualDefaultValue
        ) {
          errors.push(
            `Property '${compName}.${expectedPropName}' defaultValue is different - expected: ${expectedDefaultValue}, actual: ${actualDefaultValue}`
          );
        }
        const exptectedRaw = expectedProp.raw;
        if (exptectedRaw && exptectedRaw !== prop.type.raw) {
          errors.push(
            `Property '${compName}.${expectedPropName}' raw value is different - expected: ${exptectedRaw}, actual: ${prop.type.raw}`
          );
        }
        const expectedValue = expectedProp.value;
        if (expectedValue && !isEqual(expectedValue, prop.type.value)) {
          errors.push(
            `Property '${compName}.${expectedPropName}' value is different - expected: ${JSON.stringify(
              expectedValue
            )}, actual: ${JSON.stringify(prop.type.value)}`
          );
        }
        const expectedPropTags = expectedProp.tags;
        const propTags = prop.tags;
        if (expectedPropTags && !isEqual(expectedPropTags, propTags)) {
          errors.push(
            `Property '${compName}.${expectedPropName}' tags are different - expected: ${JSON.stringify(
              expectedPropTags
            )}, actual: ${JSON.stringify(propTags)}`
          );
        }
      }
    }
  }
  const ok = errors.length === 0;
  if (!ok) {
    console.log(JSON.stringify(actual, null, 4));
  }

  assert(ok, errors.join("\r\n"));
}
