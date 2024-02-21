events {
	worker_connections  1024;
}

http {
	server {
		listen 443 ssl;
		server_name ${SERVER_NAME};

		ssl_protocols TLSv1.3;
		ssl_certificate /etc/nginx/ssl/nginx.crt; 
		ssl_certificate_key /etc/nginx/ssl/nginx.key; 

		root /var/www/html;
		index index.html;
		client_max_body_size 5m;

		location / {
			try_files $uri $uri/ /index.php?$args;
		}

		# location / {
		# 	uwsgi_pass  django_8001;
		# 	include     /etc/nginx/uwsgi_params;
		# }
	}
}