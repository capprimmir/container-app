USE mysql;
UPDATE user set authentication_string=PASSWORD("pass123") WHERE User="root";
FLUSH PRIVILEGES;
CREATE DATABASE IF NOT EXISTS microservice;
