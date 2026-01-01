#!/bin/sh
# Custom entrypoint script for nginx non-root user

set -e

# Ensure pid directory exists and has correct permissions
if [ ! -d /var/run/nginx ]; then
    mkdir -p /var/run/nginx
    chown nginx:nginx /var/run/nginx
    chmod 755 /var/run/nginx
fi

# Verify nginx.conf has correct pid path
if ! grep -q "pid /var/run/nginx/nginx.pid" /etc/nginx/nginx.conf; then
    echo "ERROR: nginx.conf must have 'pid /var/run/nginx/nginx.pid;'" >&2
    exit 1
fi

# Test nginx configuration
nginx -t -c /etc/nginx/nginx.conf

# Start nginx with our custom config
exec nginx -c /etc/nginx/nginx.conf -g "daemon off;"

