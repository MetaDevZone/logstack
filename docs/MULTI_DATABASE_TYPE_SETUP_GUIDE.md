# 🗃️ Multi-Database Type Setup Guide

Complete guide for setting up different database types with the logstack package.

## 📋 Supported Database Types

### Document Databases

- **MongoDB** - Most popular NoSQL document database
- **CouchDB** - Apache CouchDB document database

### Relational Databases

- **PostgreSQL** - Advanced open-source relational database
- **MySQL** - Popular open-source relational database
- **MariaDB** - MySQL fork with additional features
- **SQL Server** - Microsoft SQL Server
- **Oracle** - Enterprise-grade database
- **SQLite** - File-based embedded database

### In-Memory Databases

- **Redis** - In-memory data structure store
- **Memcached** - High-performance distributed memory caching

### NoSQL Databases

- **Cassandra** - Wide-column distributed database
- **DynamoDB** - Amazon's managed NoSQL database

## 🚀 Quick Setup by Database Type

### MongoDB Setup

```bash
# Install MongoDB locally
# Ubuntu/Debian
sudo apt-get install mongodb

# macOS
brew install mongodb-community

# Windows
# Download from https://www.mongodb.com/try/download/community

# Start MongoDB
mongod --dbpath /data/db
```

```javascript
const mongoConfig = {
  dbType: "mongodb",
  dbUri: "mongodb://localhost:27017/myapp",
  uploadProvider: "s3",
  collections: {
    jobsCollectionName: "mongo_jobs",
    logsCollectionName: "mongo_logs",
    apiLogsCollectionName: "mongo_apilogs",
  },
};
```

### PostgreSQL Setup

```bash
# Install PostgreSQL
# Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib

# macOS
brew install postgresql

# Windows
# Download from https://www.postgresql.org/download/

# Start PostgreSQL
sudo systemctl start postgresql

# Create database
sudo -u postgres createdb myapp
```

```javascript
const postgresConfig = {
  dbType: "postgresql",
  dbUri: "postgresql://username:password@localhost:5432/myapp",
  uploadProvider: "gcs",
  tables: {
    jobsTableName: "postgres_jobs",
    logsTableName: "postgres_logs",
    apiLogsTableName: "postgres_apilogs",
  },
  schema: "public", // Optional schema
};
```

### MySQL Setup

```bash
# Install MySQL
# Ubuntu/Debian
sudo apt-get install mysql-server

# macOS
brew install mysql

# Windows
# Download from https://dev.mysql.com/downloads/

# Start MySQL
sudo systemctl start mysql

# Create database
mysql -u root -p
CREATE DATABASE myapp;
```

```javascript
const mysqlConfig = {
  dbType: "mysql",
  dbUri: "mysql://username:password@localhost:3306/myapp",
  uploadProvider: "azure",
  tables: {
    jobsTableName: "mysql_jobs",
    logsTableName: "mysql_logs",
    apiLogsTableName: "mysql_apilogs",
  },
};
```

### SQL Server Setup

```bash
# Install SQL Server (Linux)
curl -fsSL https://packages.microsoft.com/keys/microsoft.asc | sudo apt-key add -
sudo add-apt-repository "$(curl -fsSL https://packages.microsoft.com/config/ubuntu/20.04/mssql-server-2019.list)"
sudo apt-get update
sudo apt-get install mssql-server

# Configure SQL Server
sudo /opt/mssql/bin/mssql-conf setup

# Install SQL Server tools
sudo apt-get install mssql-tools unixodbc-dev
```

```javascript
const sqlServerConfig = {
  dbType: "sqlserver",
  dbUri: "mssql://username:password@localhost:1433/myapp",
  uploadProvider: "s3",
  tables: {
    jobsTableName: "sqlserver_jobs",
    logsTableName: "sqlserver_logs",
    apiLogsTableName: "sqlserver_apilogs",
  },
  schema: "dbo", // Optional schema
};
```

### Redis Setup

```bash
# Install Redis
# Ubuntu/Debian
sudo apt-get install redis-server

# macOS
brew install redis

# Windows
# Download from https://github.com/microsoftarchive/redis/releases

# Start Redis
redis-server

# Test connection
redis-cli ping
```

```javascript
const redisConfig = {
  dbType: "redis",
  dbUri: "redis://localhost:6379/0",
  uploadProvider: "local",
  keys: {
    jobsKeyPrefix: "redis_jobs:",
    logsKeyPrefix: "redis_logs:",
    apiLogsKeyPrefix: "redis_apilogs:",
  },
  ttl: 86400, // 24 hours TTL
};
```

### SQLite Setup

```bash
# Install SQLite
# Ubuntu/Debian
sudo apt-get install sqlite3

# macOS
brew install sqlite

# Windows
# Download from https://www.sqlite.org/download.html

# Create database file
sqlite3 myapp.db
```

```javascript
const sqliteConfig = {
  dbType: "sqlite",
  dbUri: "sqlite:./myapp.db",
  uploadProvider: "local",
  tables: {
    jobsTableName: "sqlite_jobs",
    logsTableName: "sqlite_logs",
    apiLogsTableName: "sqlite_apilogs",
  },
};
```

## ☁️ Cloud Database Configurations

### MongoDB Atlas (Cloud)

```javascript
const mongoAtlasConfig = {
  dbType: "mongodb",
  dbUri:
    "mongodb+srv://username:password@cluster.mongodb.net/myapp?retryWrites=true&w=majority",
  uploadProvider: "s3",
  collections: {
    apiLogsCollectionName: "atlas_apilogs",
  },
};
```

### Amazon RDS (PostgreSQL)

```javascript
const rdsPostgresConfig = {
  dbType: "postgresql",
  dbUri:
    "postgresql://username:password@myinstance.123456789012.us-east-1.rds.amazonaws.com:5432/myapp",
  uploadProvider: "s3",
  tables: {
    apiLogsTableName: "rds_postgres_apilogs",
  },
};
```

### Amazon RDS (MySQL)

```javascript
const rdsMysqlConfig = {
  dbType: "mysql",
  dbUri:
    "mysql://username:password@myinstance.123456789012.us-east-1.rds.amazonaws.com:3306/myapp",
  uploadProvider: "s3",
  tables: {
    apiLogsTableName: "rds_mysql_apilogs",
  },
};
```

### Azure SQL Database

```javascript
const azureSqlConfig = {
  dbType: "sqlserver",
  dbUri:
    "mssql://username:password@myserver.database.windows.net:1433/myapp?encrypt=true",
  uploadProvider: "azure",
  tables: {
    apiLogsTableName: "azure_sql_apilogs",
  },
};
```

### Google Cloud SQL (PostgreSQL)

```javascript
const gcpPostgresConfig = {
  dbType: "postgresql",
  dbUri: "postgresql://username:password@1.2.3.4:5432/myapp?sslmode=require",
  uploadProvider: "gcs",
  tables: {
    apiLogsTableName: "gcp_postgres_apilogs",
  },
};
```

### Redis Cloud

```javascript
const redisCloudConfig = {
  dbType: "redis",
  dbUri:
    "redis://:password@redis-12345.c1.us-east-1-1.ec2.cloud.redislabs.com:12345/0",
  uploadProvider: "s3",
  keys: {
    apiLogsKeyPrefix: "redis_cloud_apilogs:",
  },
};
```

## 🔧 Connection String Examples

### MongoDB Connection Strings

```bash
# Local MongoDB
mongodb://localhost:27017/myapp

# MongoDB with authentication
mongodb://username:password@localhost:27017/myapp?authSource=admin

# MongoDB Atlas
mongodb+srv://username:password@cluster.mongodb.net/myapp?retryWrites=true&w=majority

# MongoDB Replica Set
mongodb://username:password@host1:27017,host2:27017,host3:27017/myapp?replicaSet=myReplicaSet
```

### PostgreSQL Connection Strings

```bash
# Local PostgreSQL
postgresql://username:password@localhost:5432/myapp

# PostgreSQL with SSL
postgresql://username:password@localhost:5432/myapp?sslmode=require

# Amazon RDS PostgreSQL
postgresql://username:password@myinstance.123456789012.us-east-1.rds.amazonaws.com:5432/myapp

# Google Cloud SQL PostgreSQL
postgresql://username:password@1.2.3.4:5432/myapp?sslmode=require
```

### MySQL Connection Strings

```bash
# Local MySQL
mysql://username:password@localhost:3306/myapp

# MySQL with SSL
mysql://username:password@localhost:3306/myapp?ssl={"rejectUnauthorized":true}

# Amazon RDS MySQL
mysql://username:password@myinstance.123456789012.us-east-1.rds.amazonaws.com:3306/myapp

# PlanetScale MySQL
mysql://username:password@aws.connect.psdb.cloud/myapp?ssl={"rejectUnauthorized":true}
```

### SQL Server Connection Strings

```bash
# Local SQL Server
mssql://username:password@localhost:1433/myapp

# SQL Server with Windows Authentication
mssql://localhost:1433/myapp?trustedConnection=true

# Azure SQL Database
mssql://username:password@myserver.database.windows.net:1433/myapp?encrypt=true

# SQL Server with custom instance
mssql://username:password@localhost:1433/myapp?instanceName=SQLEXPRESS
```

### Redis Connection Strings

```bash
# Local Redis
redis://localhost:6379/0

# Redis with password
redis://:password@localhost:6379/0

# Redis with username and password
redis://username:password@localhost:6379/0

# Redis Cloud
redis://:password@redis-12345.c1.us-east-1-1.ec2.cloud.redislabs.com:12345/0

# AWS ElastiCache Redis
redis://my-cluster.abc123.cache.amazonaws.com:6379/0
```

## 🧪 Testing Database Connections

### Test MongoDB Connection

```javascript
const { MongoClient } = require("mongodb");

async function testMongoDB() {
  try {
    const client = new MongoClient("mongodb://localhost:27017/myapp");
    await client.connect();
    console.log("✅ MongoDB connection successful");
    await client.close();
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
  }
}

testMongoDB();
```

### Test PostgreSQL Connection

```javascript
const { Client } = require("pg");

async function testPostgreSQL() {
  const client = new Client({
    connectionString: "postgresql://username:password@localhost:5432/myapp",
  });

  try {
    await client.connect();
    console.log("✅ PostgreSQL connection successful");
    await client.end();
  } catch (error) {
    console.error("❌ PostgreSQL connection failed:", error.message);
  }
}

testPostgreSQL();
```

### Test MySQL Connection

```javascript
const mysql = require("mysql2/promise");

async function testMySQL() {
  try {
    const connection = await mysql.createConnection({
      host: "localhost",
      user: "username",
      password: "password",
      database: "myapp",
    });

    console.log("✅ MySQL connection successful");
    await connection.end();
  } catch (error) {
    console.error("❌ MySQL connection failed:", error.message);
  }
}

testMySQL();
```

### Test Redis Connection

```javascript
const redis = require("redis");

async function testRedis() {
  const client = redis.createClient({
    url: "redis://localhost:6379/0",
  });

  try {
    await client.connect();
    console.log("✅ Redis connection successful");
    await client.disconnect();
  } catch (error) {
    console.error("❌ Redis connection failed:", error.message);
  }
}

testRedis();
```

## 📊 Performance Considerations

### Database Type Performance Comparison

| Database Type  | Read Speed | Write Speed | Memory Usage | Best For          |
| -------------- | ---------- | ----------- | ------------ | ----------------- |
| **Redis**      | Excellent  | Excellent   | High         | Caching, Sessions |
| **MongoDB**    | Very Good  | Very Good   | Medium       | Document storage  |
| **PostgreSQL** | Very Good  | Good        | Medium       | Complex queries   |
| **MySQL**      | Good       | Good        | Medium       | Web applications  |
| **SQLite**     | Good       | Fair        | Low          | Local/embedded    |
| **SQL Server** | Very Good  | Good        | High         | Enterprise apps   |

### Optimization Tips

1. **MongoDB**

   - Use indexes on frequently queried fields
   - Enable sharding for large datasets
   - Use connection pooling

2. **PostgreSQL**

   - Create appropriate indexes
   - Use EXPLAIN for query optimization
   - Configure connection pooling

3. **MySQL**

   - Optimize table structure
   - Use proper indexing
   - Configure buffer sizes

4. **Redis**

   - Set appropriate TTL values
   - Use pipeline for bulk operations
   - Monitor memory usage

5. **SQL Server**
   - Use query execution plans
   - Configure memory allocation
   - Implement proper indexing

## 🔒 Security Best Practices

### Connection Security

1. **Use SSL/TLS** for all database connections
2. **Encrypt credentials** using environment variables
3. **Limit database permissions** to minimum required
4. **Use connection pooling** to prevent connection exhaustion
5. **Implement rate limiting** for API endpoints
6. **Regular security updates** for database software

### Environment Variables Template

```bash
# Secure connection strings (use environment variables)
MONGO_URI="mongodb+srv://user:pass@cluster.mongodb.net/app?retryWrites=true"
POSTGRES_URI="postgresql://user:pass@host:5432/app?sslmode=require"
MYSQL_URI="mysql://user:pass@host:3306/app?ssl=true"
SQLSERVER_URI="mssql://user:pass@host:1433/app?encrypt=true"
REDIS_URI="redis://:pass@host:6379/0"

# Cloud credentials (never commit to version control)
AWS_ACCESS_KEY_ID="your-aws-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret"
GCP_PROJECT_ID="your-project"
AZURE_STORAGE_CONNECTION_STRING="your-azure-connection"
```

## 📋 Production Checklist

### Database Setup

- [ ] Database server installed and configured
- [ ] Database created with appropriate permissions
- [ ] Connection string tested and working
- [ ] SSL/TLS enabled for secure connections
- [ ] Backup and recovery plan in place

### Application Configuration

- [ ] Database type specified correctly
- [ ] Environment variables configured securely
- [ ] Connection pooling enabled
- [ ] Error handling implemented
- [ ] Logging and monitoring configured

### Performance & Security

- [ ] Database indexes created for optimal performance
- [ ] Connection limits configured appropriately
- [ ] Security patches applied
- [ ] Access controls implemented
- [ ] Regular maintenance scheduled

### Cloud Integration

- [ ] Cloud storage provider configured
- [ ] Appropriate storage bucket/container created
- [ ] Access permissions configured
- [ ] Cost optimization settings applied
- [ ] Monitoring and alerting enabled

## 🔗 Additional Resources

### Database Documentation

- [MongoDB Manual](https://docs.mongodb.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [SQL Server Documentation](https://docs.microsoft.com/en-us/sql/)
- [Redis Documentation](https://redis.io/documentation)

### Cloud Database Services

- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [Amazon RDS](https://aws.amazon.com/rds/)
- [Google Cloud SQL](https://cloud.google.com/sql)
- [Azure Database](https://azure.microsoft.com/en-us/services/azure-sql/)
- [Redis Cloud](https://redislabs.com/redis-cloud/)

### Performance Monitoring

- [MongoDB Compass](https://www.mongodb.com/products/compass)
- [pgAdmin](https://www.pgadmin.org/)
- [MySQL Workbench](https://www.mysql.com/products/workbench/)
- [SQL Server Management Studio](https://docs.microsoft.com/en-us/sql/ssms/)
- [RedisInsight](https://redislabs.com/redis-enterprise/redis-insight/)
