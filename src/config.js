module.exports = {
    PORT: process.env.PORT || 8000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    API_TOKEN: process.env.API_TOKEN || 'dummy-api-token',
    MEALDB_KEY: process.env.MEALDB_KEY,
    DATABASE_URL: process.env.DATABASE_URL || 'postgresql://dunder_mifflin@localhost/whats-for-dinner',
    TEST_DATABASE_URL: process.env.TEST_DATABASE_URL || 'postgresql://dunder_mifflin@localhost/whats-for-dinner-test'

  };
