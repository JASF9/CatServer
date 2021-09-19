# cat-server
Server side CATAPI test
Servidor para prueba con CATAPI. Hecho con PostgreSQL.
Para iniciar el proyecto primero descargar dependencias con el comando 'npm install' y luego correr con el comando 'npm run dev'.
Actualmente esta configurado para utilizar una base de datos desplegada en la plataforma Heroku.
Si se desea utilizar una base de datos local:
- Utilizar los comandos del archivo catdb para crear las tablas de la base de datos.
- Sustituir las credenciales de conexion de la base de datos que se encuentran en el archivo .env por las de la nueva base de datos.
- Emplear el endpoint /populate una vez para rellenar las tablas con datos de CATAPI.

Muchas gracias por su tiempo.
