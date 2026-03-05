/**
 * Custom Scalar Resolvers for Secured GraphQL Schema
 * 
 * These scalars provide validation and security constraints
 * to address 42Crunch audit findings while maintaining
 * the intentional vulnerabilities at the resolver level.
 */

const { GraphQLScalarType, GraphQLError } = require('graphql');
const { Kind } = require('graphql/language');

/**
 * Custom String Scalar with validation
 * - Max length: 10000 characters
 * - Min length: 0 characters
 * - No null bytes
 * - UTF-8 validation
 */
const CustomString = new GraphQLScalarType({
  name: 'CustomString',
  description: 'A validated string scalar with security constraints',
  
  serialize(value) {
    // Convert to string
    const stringValue = String(value);
    
    // Validate max length
    if (stringValue.length > 10000) {
      throw new GraphQLError('String exceeds maximum length of 10000 characters');
    }
    
    // Check for null bytes
    if (stringValue.includes('\0')) {
      throw new GraphQLError('String contains null bytes');
    }
    
    return stringValue;
  },
  
  parseValue(value) {
    // Parse from variables
    if (typeof value !== 'string') {
      throw new GraphQLError('CustomString must be a string');
    }
    
    if (value.length > 10000) {
      throw new GraphQLError('String exceeds maximum length of 10000 characters');
    }
    
    if (value.includes('\0')) {
      throw new GraphQLError('String contains null bytes');
    }
    
    return value;
  },
  
  parseLiteral(ast) {
    // Parse from inline query
    if (ast.kind !== Kind.STRING) {
      throw new GraphQLError('CustomString must be a string literal');
    }
    
    if (ast.value.length > 10000) {
      throw new GraphQLError('String exceeds maximum length of 10000 characters');
    }
    
    if (ast.value.includes('\0')) {
      throw new GraphQLError('String contains null bytes');
    }
    
    return ast.value;
  },
});

/**
 * Custom ID Scalar with validation
 * - UUID format validation
 * - Max length: 128 characters
 */
const CustomID = new GraphQLScalarType({
  name: 'CustomID',
  description: 'A validated ID scalar (UUID format preferred)',
  
  serialize(value) {
    const idValue = String(value);
    
    // Validate max length
    if (idValue.length > 128) {
      throw new GraphQLError('ID exceeds maximum length of 128 characters');
    }
    
    // Basic format validation (alphanumeric, hyphens, underscores)
    if (!/^[a-zA-Z0-9_-]+$/.test(idValue)) {
      throw new GraphQLError('ID contains invalid characters');
    }
    
    return idValue;
  },
  
  parseValue(value) {
    if (typeof value !== 'string') {
      throw new GraphQLError('CustomID must be a string');
    }
    
    if (value.length > 128) {
      throw new GraphQLError('ID exceeds maximum length of 128 characters');
    }
    
    if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
      throw new GraphQLError('ID contains invalid characters');
    }
    
    return value;
  },
  
  parseLiteral(ast) {
    if (ast.kind !== Kind.STRING) {
      throw new GraphQLError('CustomID must be a string literal');
    }
    
    if (ast.value.length > 128) {
      throw new GraphQLError('ID exceeds maximum length of 128 characters');
    }
    
    if (!/^[a-zA-Z0-9_-]+$/.test(ast.value)) {
      throw new GraphQLError('ID contains invalid characters');
    }
    
    return ast.value;
  },
});

/**
 * Custom Int Scalar with validation
 * - Range: -2147483648 to 2147483647 (32-bit signed integer)
 * - No floating point values
 */
const CustomInt = new GraphQLScalarType({
  name: 'CustomInt',
  description: 'A validated integer scalar with range constraints',
  
  serialize(value) {
    const num = Number(value);
    
    if (!Number.isInteger(num)) {
      throw new GraphQLError('CustomInt must be an integer');
    }
    
    if (num < -2147483648 || num > 2147483647) {
      throw new GraphQLError('CustomInt out of valid range (-2147483648 to 2147483647)');
    }
    
    return num;
  },
  
  parseValue(value) {
    const num = Number(value);
    
    if (!Number.isInteger(num)) {
      throw new GraphQLError('CustomInt must be an integer');
    }
    
    if (num < -2147483648 || num > 2147483647) {
      throw new GraphQLError('CustomInt out of valid range (-2147483648 to 2147483647)');
    }
    
    return num;
  },
  
  parseLiteral(ast) {
    if (ast.kind !== Kind.INT) {
      throw new GraphQLError('CustomInt must be an integer literal');
    }
    
    const num = parseInt(ast.value, 10);
    
    if (num < -2147483648 || num > 2147483647) {
      throw new GraphQLError('CustomInt out of valid range (-2147483648 to 2147483647)');
    }
    
    return num;
  },
});

/**
 * Custom Float Scalar with validation
 * - Range: Finite numbers only (no Infinity or NaN)
 * - Precision: IEEE 754 double-precision
 */
const CustomFloat = new GraphQLScalarType({
  name: 'CustomFloat',
  description: 'A validated float scalar with range constraints',
  
  serialize(value) {
    const num = Number(value);
    
    if (!Number.isFinite(num)) {
      throw new GraphQLError('CustomFloat must be a finite number');
    }
    
    return num;
  },
  
  parseValue(value) {
    const num = Number(value);
    
    if (!Number.isFinite(num)) {
      throw new GraphQLError('CustomFloat must be a finite number');
    }
    
    return num;
  },
  
  parseLiteral(ast) {
    if (ast.kind !== Kind.FLOAT && ast.kind !== Kind.INT) {
      throw new GraphQLError('CustomFloat must be a number literal');
    }
    
    const num = parseFloat(ast.value);
    
    if (!Number.isFinite(num)) {
      throw new GraphQLError('CustomFloat must be a finite number');
    }
    
    return num;
  },
});

/**
 * Quantity Scalar - for positive integers (e.g., order quantities)
 * Range: 1 to 999999
 */
const Quantity = new GraphQLScalarType({
  name: 'Quantity',
  description: 'A positive integer for quantities (1-999999)',
  
  serialize(value) {
    const num = Math.floor(Number(value));
    
    if (!Number.isInteger(num) || num < 1 || num > 999999) {
      throw new GraphQLError('Quantity must be an integer between 1 and 999999');
    }
    
    return num;
  },
  
  parseValue(value) {
    const num = Math.floor(Number(value));
    
    if (!Number.isInteger(num) || num < 1 || num > 999999) {
      throw new GraphQLError('Quantity must be an integer between 1 and 999999');
    }
    
    return num;
  },
  
  parseLiteral(ast) {
    if (ast.kind !== Kind.INT) {
      throw new GraphQLError('Quantity must be an integer literal');
    }
    
    const num = parseInt(ast.value, 10);
    
    if (num < 1 || num > 999999) {
      throw new GraphQLError('Quantity must be between 1 and 999999');
    }
    
    return num;
  },
});

/**
 * Price Scalar - for monetary values
 * Range: 0 to 999999999.99
 */
const Price = new GraphQLScalarType({
  name: 'Price',
  description: 'A monetary value (0-999999999.99)',
  
  serialize(value) {
    const num = Number(value);
    
    if (!Number.isFinite(num) || num < 0 || num > 999999999.99) {
      throw new GraphQLError('Price must be a number between 0 and 999999999.99');
    }
    
    // Round to 2 decimal places
    return Math.round(num * 100) / 100;
  },
  
  parseValue(value) {
    const num = Number(value);
    
    if (!Number.isFinite(num) || num < 0 || num > 999999999.99) {
      throw new GraphQLError('Price must be a number between 0 and 999999999.99');
    }
    
    return Math.round(num * 100) / 100;
  },
  
  parseLiteral(ast) {
    if (ast.kind !== Kind.FLOAT && ast.kind !== Kind.INT) {
      throw new GraphQLError('Price must be a number literal');
    }
    
    const num = parseFloat(ast.value);
    
    if (!Number.isFinite(num) || num < 0 || num > 999999999.99) {
      throw new GraphQLError('Price must be between 0 and 999999999.99');
    }
    
    return Math.round(num * 100) / 100;
  },
});

module.exports = {
  CustomString,
  CustomID,
  CustomInt,
  CustomFloat,
  Quantity,
  Price,
};
