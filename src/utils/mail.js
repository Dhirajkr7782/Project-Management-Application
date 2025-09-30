import Mailgen from "mailgen";
import nodemailer from "nodemailer";
import 'dotenv/config';


const sendEmail = async(options)=>{
    const mailGenerator = new Mailgen({
        theme: "default",
        product:{
            name:"Task Manager",
            link:"https://taskmanagelink.com"


        }
    })
    const emailTextual = mailGenerator.generatePlaintext(options.mailgenContent);
    const emailHtml = mailGenerator.generate(options.mailgenContent);

    const transporter = nodemailer.createTransport({
        host:process.env.MAILTRAP_SMTP_HOST,
        port:process.env.MAILTRAP_SMTP_PORT,
        auth:{
            user:process.env.MAILTRAP_SMTP_USER,
            pass:process.env.MAILTRAP_SMTP_PASSWORD,
        }
    })
    const mail={
        from: "mail.taskmanager@example.com",
        to:options.email,
        subject:options.subject,
        text:emailTextual,
        html:emailHtml,
    

    }
    try{
        await transporter.sendMail(mail);

    }catch(err){

        console.error("Email service failed siliently . Make sure thst you have provided your MAILTRAP credentials in the .env file");
        console.error("Error:",err);
    }



}

const emailVerificationMail = (username,verificationUrl)=>{
    return {
        body:{
            name:username,
            intro:"Welcome to our App we'are excited to have you on board.",
            action:{
                instructions:"To verify your account, please click here:",
                button:{
                    color:"#22BC66",
                    text:"Verify  your email Account",
                    link:verificationUrl,
                },
            },
            outro:"Need help, or have questions? Just reply to this email, we'd love to help."
        }

   }
};

const forgotPasswordMailgenContent =(username,resetUrl)=>{
    return {
        body:{
            name:username,
            intro:"You have requested to reset your password",
            action:{
                instructions:"Click the button below to reset your password:",
                button:{
                    color:"#DC4D2F",
                    text:"Reset your password",
                    link:resetUrl,
                },
            },
            outro: "Need help, or have questions? Just reply to this email, we'd love to help."
            }
    }

};

export {emailVerificationMail,forgotPasswordMailgenContent,sendEmail};