-- SQL inicializáció az Opera Archívumhoz (PostgreSQL)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(150) UNIQUE,
  password VARCHAR(255),
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150),
  email VARCHAR(150),
  message TEXT,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS enekes (
  id SERIAL PRIMARY KEY,
  nev VARCHAR(200),
  szulev INT,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS mu (
  id SERIAL PRIMARY KEY,
  szerzo VARCHAR(200),
  cim VARCHAR(300)
);
CREATE TABLE IF NOT EXISTS szerep (
  id SERIAL PRIMARY KEY,
  szerepnev VARCHAR(300),
  muid INT,
  hang VARCHAR(100)
);
CREATE TABLE IF NOT EXISTS repertoar (
  enekesid INT,
  szerepid INT,
  utoljara INT,
  PRIMARY KEY (enekesid, szerepid)
);
