const accountReject = (userName) => {
    return `<!DOCTYPE html>
	<html>
	
	<head>
		<meta charset="UTF-8">
		<title>Account Rejection Email</title>
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
				color: #e53935;
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
	
			.footer {
				font-size: 14px;
				color: #999999;
				margin-top: 20px;
			}
		</style>
	</head>
	
	<body>
		<div class="container">
			<div class="header">Account Rejected</div>
			<div class="body">
				<p>Hi <span class="highlight">${userName}</span>,</p>
				<p>We regret to inform you that your account has been rejected due to incorrect details.</p>
				<p>Please review your information and try again. For more details, feel free to contact our support team.</p>
			</div>
			<div class="footer">
				<p>Thank you for your understanding.</p>
			</div>
		</div>
	</body>
	
	</html>`;
};
module.exports = accountReject;
