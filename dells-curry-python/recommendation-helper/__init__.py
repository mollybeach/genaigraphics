import urllib.request
import json
import os
import ssl
import logging
import requests
import azure.functions as func

def allowSelfSignedHttps(allowed):
    # bypass the server certificate verification on client side
    if allowed and not os.environ.get('PYTHONHTTPSVERIFY', '') and getattr(ssl, '_create_unverified_context', None):
        ssl._create_default_https_context = ssl._create_unverified_context

allowSelfSignedHttps(True)  # this line is needed if you use a self-signed certificate in your scoring service.
    
def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Python HTTP trigger function processed a request.')

    # Request data goes here
    # The example below assumes JSON formatting which may be updated
    # depending on the format your endpoint expects.
    # More information can be found here:
    # https://docs.microsoft.com/azure/machine-learning/how-to-deploy-advanced-entry-script
    req_body = req.get_json()
    data = {"question": req_body.get("question"), "chat_history": req_body.get("chat_history")}

    body = str.encode(json.dumps(data))
    url = "https://recommendation-endpoint.eastus2.inference.ml.azure.com/score"
    api_key = "eVRRzvt0szc1d7aK13K4ts6IKD3G5Kft"

    # Replace this with the primary/secondary key or AMLToken for the endpoint
    if not api_key:
        raise Exception("A key should be provided to invoke the endpoint")

    # The azureml-model-deployment header will force the request to go to a specific deployment.
    # Remove this header to have the request observe the endpoint traffic rules
    headers = {'Content-Type': 'application/json', 'Authorization': ('Bearer ' + api_key), 'azureml-model-deployment': 'blue'}

    req = urllib.request.Request(url, body, headers)

    try:
        response = urllib.request.urlopen(req)

        result = response.read()
        result_text = result.decode("utf-8")
        logging.info(result_text)
        
        
        if result_text:
            return func.HttpResponse(f"{result_text}")
    except urllib.error.HTTPError as error:
        logging.error("The request failed with status code: " + str(error.code))

        # Print the headers - they include the request ID and the timestamp, which are useful for debugging the failure
        logging.error(error.info())
        error_message = error.read().decode("utf8", 'ignore')
        logging.error(error_message)
        return func.HttpResponse(
            f"The request failed with status code: {error.code}. Error: {error_message}",
            status_code=500
        )
