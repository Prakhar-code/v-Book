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

def send_request_status_email( booking_data,cabin_name,subject):
    if not all([ subject, cabin_name,booking_data]):
        return False
    sender_email = settings.mail_address
    sender_password = settings.mail_password
    body = f""" <html>
                <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
                    <div>
                        <p>Your Booking request has been Sent for Confirmation for <strong>{cabin_name}</strong>.</p>
                        <p>Booking Details: <span style="color: red;"><b>{booking_data["startTime"]} to {booking_data["endTime"]}</b></span></p>
                        
                        <p style="margin-top: 20px;">Thank you for using our vBook booking service!</p>
                        
                        <div style="margin-top: 30px;  padding-top: 10px; font-style: italic;">
                            Best regards,<br>
                            Admin VBook<br>
                        </div>
                    </div>
                </body>
            </html>              
        """

    msg = MIMEMultipart()
    msg["From"] = formataddr(("Yash Admin", sender_email))
    msg["To"] = booking_data["email"]
    msg["Subject"] = subject
    msg.attach(MIMEText(body, "html"))

    try:
        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.starttls()
        server.login(sender_email, sender_password)
        text = msg.as_string()
        server.sendmail(sender_email, booking_data["email"], text)
        server.quit()
        print("Email sent successfully")
        return True
    except Exception as e:
        print(f"Failed to send email: {e}")
    return False


def send_ticket_mail(email, name, ticket_id, description, response, status, subject):
    if not all([subject, name, ticket_id, email, status, description, response]):
        logging.error("Missing required parameters for sending email")
        return False

    try:
        sender_email = settings.mail_address
        print(sender_email)
        sender_password = settings.mail_password

        body = f""" <html>
<body>
<p>Dear {name},</p>
<p>The Status of your ticket has been moved to the following state: <strong>{status}</strong>. 
<br><strong>Please find the details below:</strong>
<br> <strong>Ticket ID</strong>: {ticket_id} <br>
<strong>Query</strong>: {description} <br>
<strong>Resolution</strong>: {response} <br>
</p>
<p>Thank you.</p>
<p>Regards,<br>Team vBook</p>
</body>
</html>              
            """

        msg = MIMEMultipart()
        msg["From"] = formataddr(("Yash Admin", sender_email))
        msg["To"] = email
        msg["Subject"] = subject
        msg.attach(MIMEText(body, "html"))

        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.starttls()
        server.login(sender_email, sender_password)
        text = msg.as_string()
        server.sendmail(sender_email, email, text)
        server.quit()

        logging.info(f"Email sent successfully for ticket {ticket_id}")
        return True

    except Exception as e:
        logging.error(f"Failed to send email for ticket {ticket_id}: {str(e)}")
        return False
