USE mysql;
UPDATE USER set authentication_string=PASSWORD("pass123") WHERE USER="root";
FLUSH PRIVILEGES;
CREATE DATABASE IF NOT EXISTS microservice;
