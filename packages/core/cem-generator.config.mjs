import ts from 'typescript';
import { litPlugin } from '@wc-toolkit/cem-generator-lit';
import { cemGeneratorCssPrefixPlugin } from '@charm-ux/theming/cem-plugin';

const lit = litPlugin();
const litPluginWithCharmBaseDetection = {
  ...lit,
  shouldAnalyze: () => true,
  onFile(context) {
    const fragment = lit.onFile(context);
    const propertyDecoratorNames = new Set(['property']);

    for (const statement of context.sourceFile.statements) {
      if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier)) continue;
      if (statement.moduleSpecifier.text !== 'lit' && statement.moduleSpecifier.text !== 'lit/decorators.js') continue;

      const bindings = statement.importClause?.namedBindings;
      if (!bindings || !ts.isNamedImports(bindings)) continue;

      for (const binding of bindings.elements) {
        if ((binding.propertyName?.text ?? binding.name.text) === 'property') {
          propertyDecoratorNames.add(binding.name.text);
        }
      }
    }

    ts.forEachChild(context.sourceFile, function visit(node) {
      if (ts.isClassDeclaration(node) && node.name) {
        const declaration = fragment[node.name.text];

        if (declaration) {
          for (const member of node.members) {
            if (!ts.isGetAccessorDeclaration(member) && !ts.isSetAccessorDeclaration(member)) continue;

            const decorator = (ts.getDecorators(member) ?? []).find(item => {
              const expression = ts.isCallExpression(item.expression) ? item.expression.expression : item.expression;
              return ts.isIdentifier(expression) && propertyDecoratorNames.has(expression.text);
            });

            if (!decorator) continue;

            const name = member.name.getText(context.sourceFile).replace(/^['"]|['"]$/g, '');
            const argument = ts.isCallExpression(decorator.expression) ? decorator.expression.arguments[0] : undefined;
            const options = argument && ts.isObjectLiteralExpression(argument) ? argument.properties : [];
            const getOption = key =>
              options.find(option => ts.isPropertyAssignment(option) && option.name.getText() === key);
            const attributeOption = getOption('attribute')?.initializer;
            if (attributeOption?.kind === ts.SyntaxKind.FalseKeyword) continue;

            const attribute =
              attributeOption && ts.isStringLiteralLike(attributeOption)
                ? attributeOption.text
                : name.replace(/[A-Z]/g, character => `-${character.toLowerCase()}`);
            const reflectOption = getOption('reflect')?.initializer;
            const reflects = reflectOption?.kind === ts.SyntaxKind.TrueKeyword;
            const accessorType = member.type
              ? context.checker.typeToString(context.checker.getTypeFromTypeNode(member.type))
              : undefined;
            const property = declaration.members?.find(item => item.name === name);

            if (property) {
              property.attribute = attribute;
              property.reflects = reflects || undefined;
            }

            const attributes = declaration.attributes ?? (declaration.attributes = []);
            const existing = attributes.find(item => item.name === attribute);
            if (!existing) {
              attributes.push({
                name: attribute,
                fieldName: name,
                type: accessorType,
                reflects: reflects || undefined,
              });
            }
          }
        }
      }

      ts.forEachChild(node, visit);
    });

    return fragment;
  },
};
const cemOutputCompatibilityPlugin = {
  name: 'charm-cem-output-compatibility',
  afterGenerate(manifest) {
    const normalizeType = item => {
      if (item.type && item.parsedType?.text) {
        item.type.text = item.parsedType.text;
        delete item.parsedType;
      }

      for (const parameter of item.parameters ?? []) normalizeType(parameter);
      if (item.return) normalizeType(item.return);
    };

    for (const module of manifest.modules) {
      for (const declaration of module.declarations ?? []) {
        if (declaration.kind === 'class' && !declaration.tagName && declaration.name !== 'CharmElement') {
          delete declaration.customElement;
        }

        for (const member of declaration.members ?? []) normalizeType(member);
        for (const event of declaration.events ?? []) normalizeType(event);

        for (const attribute of declaration.attributes ?? []) {
          const member = declaration.members?.find(
            item => item.name === attribute.fieldName || item.attribute === attribute.name
          );
          if (member?.type) attribute.type = member.type;
          normalizeType(attribute);
        }
      }
    }
  },
};

export default {
  tsConfigPath: './tsconfig.json',
  include: ['src/components/**/*.ts', 'src/base/**/*.ts'],
  exclude: [
    '**/*.performance.ts',
    '**/*.stories.ts',
    '**/*.styles.ts',
    '**/*.test.ts',
    '**/*.test-harness.ts',
    '**/index.ts',
    '**/types.ts',
  ],
  // The Lit detector's default source-text prefilter skips files extending our
  // Charm Lit base classes, so the configured component/base file set is explicit.
  plugins: [litPluginWithCharmBaseDetection, cemGeneratorCssPrefixPlugin(), cemOutputCompatibilityPlugin],
  customJsDocTags: {
    since: {},
    dependency: {
      mappedName: 'dependencies',
      isArray: true,
    },
    status: {},
  },
};
