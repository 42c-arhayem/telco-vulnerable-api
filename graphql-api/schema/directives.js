/**
 * Custom Directive Implementations for Secured GraphQL Schema
 * 
 * Implements @cost and @list directives to address 42Crunch audit findings
 */

const { GraphQLError } = require('graphql');
const { MapperKind, mapSchema, getDirective } = require('@graphql-tools/utils');

/**
 * Cost Directive Implementation
 * Tracks query complexity to prevent DoS attacks
 * 
 * Usage: @cost(complexity: 10, multipliers: ["first"], useMultipliers: true)
 */
function costDirectiveTransformer(schema, directiveName = 'cost') {
  return mapSchema(schema, {
    [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
      const costDirective = getDirective(schema, fieldConfig, directiveName)?.[0];
      
      if (costDirective) {
        const { complexity, multipliers, useMultipliers } = costDirective;
        
        // Attach cost metadata to the field
        fieldConfig.extensions = {
          ...fieldConfig.extensions,
          cost: {
            complexity: complexity || 1,
            multipliers: multipliers || [],
            useMultipliers: useMultipliers || false,
          },
        };
      }
      
      return fieldConfig;
    },
  });
}

/**
 * List Directive Implementation
 * Validates list size constraints to prevent resource exhaustion
 * 
 * Usage: @list(maxItems: 100, minItems: 1)
 */
function listDirectiveTransformer(schema, directiveName = 'list') {
  return mapSchema(schema, {
    [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
      const listDirective = getDirective(schema, fieldConfig, directiveName)?.[0];
      
      if (listDirective) {
        const { maxItems, minItems } = listDirective;
        const { resolve = (source, args, context, info) => source[info.fieldName] } = fieldConfig;
        
        // Wrap the resolver to enforce list constraints
        fieldConfig.resolve = async (source, args, context, info) => {
          const result = await resolve(source, args, context, info);
          
          if (Array.isArray(result)) {
            // Validate max items
            if (maxItems !== undefined && result.length > maxItems) {
              throw new GraphQLError(
                `List exceeds maximum size of ${maxItems} items (got ${result.length})`,
                { path: info.path }
              );
            }
            
            // Validate min items
            if (minItems !== undefined && result.length < minItems) {
              throw new GraphQLError(
                `List has fewer than minimum ${minItems} items (got ${result.length})`,
                { path: info.path }
              );
            }
          }
          
          return result;
        };
      }
      
      return fieldConfig;
    },
    
    [MapperKind.INPUT_OBJECT_FIELD]: (inputFieldConfig) => {
      const listDirective = getDirective(schema, inputFieldConfig, directiveName)?.[0];
      
      if (listDirective) {
        const { maxItems, minItems } = listDirective;
        
        // Store list constraints for validation
        inputFieldConfig.extensions = {
          ...inputFieldConfig.extensions,
          listConstraints: {
            maxItems,
            minItems,
          },
        };
      }
      
      return inputFieldConfig;
    },
  });
}

/**
 * Validate List Input Constraints
 * Call this in resolvers to validate input lists
 */
function validateListInputs(args, schema) {
  // This would need to traverse the input object tree
  // and validate list constraints - simplified for demo
  // In production, use a validation library or middleware
}

module.exports = {
  costDirectiveTransformer,
  listDirectiveTransformer,
  validateListInputs,
};
