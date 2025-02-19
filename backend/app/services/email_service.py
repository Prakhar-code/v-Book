import smtplib
import logging
from email.utils import formataddr
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings
from app.models.cabin_request import CabinRequest

def send_verification_email(email, subject, otp):
    if not all([email, subject, otp]):
        return False
    sender_email = settings.mail_address
    sender_password = settings.mail_password
    body = f""" <html>
                    <body>
                        <p>Your One Time verification code is: <span style="color: red;"><b>{otp}</b></span></p>
                        <p>The OTP is valid only for <b>10 minutes. </b>Do not share this code with anyone.</p>
                    </body>
                </html>              
            """
 
    msg = MIMEMultipart()
    msg["From"] = formataddr(("Yash Admin", sender_email))
    msg["To"] = email
    msg["Subject"] = subject
    msg.attach(MIMEText(body, "html"))
 
    try:
        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.starttls()
        server.login(sender_email, sender_password)
        text = msg.as_string()
        server.sendmail(sender_email, email, text)
        server.quit()
        print("Email sent successfully")
        return True
    except Exception as e:
        print(f"Failed to send email: {e}")
    return False

