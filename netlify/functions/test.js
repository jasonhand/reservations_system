exports.handler = async function(event, context) {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE'
    },
    body: JSON.stringify({
      message: 'Netlify Functions are working!',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      event: {
        httpMethod: event.httpMethod,
        path: event.path,
        queryStringParameters: event.queryStringParameters
      }
    })
  };
}; 