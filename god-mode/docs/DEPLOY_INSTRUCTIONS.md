# Deployment Instructions

## Fresh Install with Auto-Generated Credentials

This deployment will automatically:
1. Generate secure random passwords for all services
2. Create the Directus admin user
3. Save all credentials to a file you can retrieve

### Deploy Steps:

1. **In Coolify, set ONLY these environment variables:**
   ```
   ADMIN_EMAIL=admin@sparkplatform.local
   DB_USER=sparkuser
   DB_DATABASE=directus
   ```

2. **Deploy the application**

3. **Retrieve your credentials:**
   ```bash
   docker exec <directus-container-name> cat /directus/credentials.txt
   ```

4. **Login to Directus:**
   - URL: https://spark.jumpstartscaling.com
   - Email: admin@sparkplatform.local
   - Password: (from credentials.txt)

### Security Note:
All passwords are randomly generated using `openssl rand -base64` and are unique per deployment.
