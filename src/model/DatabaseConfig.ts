export class DatabaseConfig {
  host: string;
  name: string;
  user: string;
  password: string;
  port: number;

  constructor() {
    this.host = process.env.DB_HOST + "";
    this.name = process.env.DB_NAME + "";
    this.user = process.env.DB_USER + "";
    this.password = process.env.DB_PASSWORD + "";
    this.port = parseInt(process.env.DB_PORT + "");
  }
}
