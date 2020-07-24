module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch:['**/testFiles/*.ts'],
  globals:{
      'ts-jest':{
          tsConfig:"./testFiles/tsconfig.json"
      }
  }
};