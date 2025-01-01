const verifyAccountTemplate = (userName, email) => {
	return `<!DOCTYPE html>
	<html>
	
	<head>
		<meta charset="UTF-8">
		<title>Account Verification Email</title>
		<style>
			body {
				background-color: #f9f9f9;
				font-family: Arial, sans-serif;
				font-size: 16px;
				line-height: 1.6;
				color: #333333;
				margin: 0;
				padding: 0;
			}
	
			.container {
				max-width: 600px;
				margin: 30px auto;
				background-color: #ffffff;
				padding: 20px;
				border-radius: 10px;
				box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
				text-align: center;
			}
	
			.header {
				font-size: 24px;
				font-weight: bold;
				color: #4CAF50;
				margin-bottom: 20px;
			}
	
			.body {
				font-size: 16px;
				color: #555555;
				margin-bottom: 20px;
			}
	
			.user-info {
				font-size: 18px;
				color: #333333;
				margin-bottom: 15px;
			}
	
			.cta {
				display: inline-block;
				padding: 12px 30px;
				background-color: #4CAF50;
				color: #ffffff;
				text-decoration: none;
				border-radius: 5px;
				font-size: 16px;
				font-weight: bold;
				margin-top: 20px;
			}
	
			.cta:hover {
				background-color: #45a049;
			}
	
			.footer {
				font-size: 14px;
				color: #999999;
				margin-top: 20px;
			}
		</style>
	</head>
	
	<body>
		<div class="container">
			<div class="header">Your Account is Verified!</div>
			<div class="body">
				<p>Hi <span class="highlight">${userName}</span>,</p>
				<p>We’re excited to let you know that your account associated with the email:</p>
				<div class="user-info">${email}</div>
				<p>has been successfully verified. You can now log in and start exploring our platform.</p>
				<a href="https://your-website.com/login" class="cta">Login Now</a>
			</div>
			<div class="footer">
				<p>If you have any questions or concerns, feel free to contact our support team.</p>
				<p>Thank you for choosing our platform!</p>
			</div>
		</div>
	</body>
	
	</html>`;
};
module.exports = verifyAccountTemplate;
