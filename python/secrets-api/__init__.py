import logging
from azure.appconfiguration import AzureAppConfigurationClient
import azure.functions as func

# Do not hard-code credentials; consider Azure Key Vault or Environment Variables
app_config_connection_string = "Endpoint=https://vz-prod-appconfig.azconfig.io;Id=aMah;Secret=gdgUR0rIDKHOKA+cREnaDEAS9WbGsPxOU/XnmWfIwxU="
client = AzureAppConfigurationClient.from_connection_string(app_config_connection_string)

def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Python HTTP trigger function processed a request.')

    key = req.route_params.get('key')
    if key:
        try:
            setting = client.get_configuration_setting(key=key)
            return func.HttpResponse(str(setting.value), status_code=200)
        except Exception as e:
            logging.error(f"Error fetching secret: {str(e)}")
            return func.HttpResponse("Failed to fetch secret", status_code=500)
    else:
        return func.HttpResponse("Please pass a key in the URL path", status_code=400)
import logging
from azure.appconfiguration import AzureAppConfigurationClient
import azure.functions as func

# Do not hard-code credentials; consider Azure Key Vault or Environment Variables
app_config_connection_string = "Endpoint=https://vz-prod-appconfig.azconfig.io;Id=aMah;Secret=gdgUR0rIDKHOKA+cREnaDEAS9WbGsPxOU/XnmWfIwxU="
client = AzureAppConfigurationClient.from_connection_string(app_config_connection_string)

def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Python HTTP trigger function processed a request.')

    key = req.route_params.get('key')
    if key:
        try:
            setting = client.get_configuration_setting(key=key)
            return func.HttpResponse(str(setting.value), status_code=200)
        except Exception as e:
            logging.error(f"Error fetching secret: {str(e)}")
            return func.HttpResponse("Failed to fetch secret", status_code=500)
    else:
        return func.HttpResponse("Please pass a key in the URL path", status_code=400)
