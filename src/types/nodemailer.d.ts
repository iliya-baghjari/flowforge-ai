declare module "nodemailer" {
  export type Transport = unknown;
  export type SendMailOptions = Record<string, unknown>;

  interface CreateTransportOptions {
    host?: string;
    port?: number;
    secure?: boolean;
    auth?: {
      user?: string;
      pass?: string;
    };
  }

  interface MailerTransport {
    sendMail(options: SendMailOptions): Promise<unknown>;
  }

  function createTransport(options: CreateTransportOptions): MailerTransport;

  const nodemailer: {
    createTransport: typeof createTransport;
  };

  export default nodemailer;
}
