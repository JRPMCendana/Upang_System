const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const config = require('../config/config');

class EmailService {
  static getTransporter() {
    if (!config.email.host || !config.email.auth.user || !config.email.auth.pass) {
      throw {
        status: 500,
        message: 'Email configuration is missing. Please check your SMTP settings in .env file.'
      };
    }

    return nodemailer.createTransport({
      host: config.email.host,
      port: parseInt(config.email.port, 10),
      secure: config.email.secure === 'true' || config.email.secure === true,
      auth: {
        user: config.email.auth.user,
        pass: config.email.auth.pass
      },
      tls: {
        rejectUnauthorized: false
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000
    });
  }

  static loadTemplate(templateName) {
    const templateDir = path.join(__dirname, '../templates');
    const htmlPath = path.join(templateDir, `${templateName}.html`);
    const txtPath = path.join(templateDir, `${templateName}.txt`);

    try {
      const html = fs.readFileSync(htmlPath, 'utf8');
      let text = '';
      
      // Text template is optional
      if (fs.existsSync(txtPath)) {
        text = fs.readFileSync(txtPath, 'utf8');
      }
      
      return { html, text };
    } catch (error) {
      throw {
        status: 500,
        message: `Failed to load email template: ${templateName}`
      };
    }
  }

  static replacePlaceholders(template, data) {
    let result = template;
    for (const [key, value] of Object.entries(data)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(regex, value);
    }
    return result;
  }

  static generateAccountCreatedEmail(email, password, firstName, lastName, role) {
    const fullName = firstName && lastName ? `${firstName} ${lastName}` : email;
    const roleName = role === 'teacher' ? 'Teacher' : 'Student';
    const frontendUrl = config.email.frontendUrl

    const templates = this.loadTemplate('account-created');
    
    const templateData = {
      fullName,
      roleName,
      email,
      password,
      frontendUrl
    };

    return {
      subject: `Welcome to UPANG Learning System - Account Created`,
      html: this.replacePlaceholders(templates.html, templateData),
      text: templates.text ? this.replacePlaceholders(templates.text, templateData) : ''
    };
  }

  static async sendAccountCreatedEmail(email, password, firstName, lastName, role) {
    try {
      const transporter = this.getTransporter();
      
      const mailOptions = {
        from: `"UPANG Learning System" <${config.email.from}>`,
        to: email,
        ...this.generateAccountCreatedEmail(email, password, firstName, lastName, role)
      };

      const info = await transporter.sendMail(mailOptions);
      
      return {
        success: true,
        messageId: info.messageId
      };
    } catch (error) {
      console.error('Email sending error:', error);
      throw {
        status: 500,
        message: 'Failed to send email. Please contact administrator.'
      };
    }
  }
}

module.exports = EmailService;

