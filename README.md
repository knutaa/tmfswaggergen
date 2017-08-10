# Generate Node.js server for Bluemix

## Overview
This bundle allows a creation of a Bluemix ready node.js server, created only from a swagger file. The contained jar and the templates are sufficient for a server creation. For compiling the JAR on its own, the Java files that must be substituted in the original framework are added in the Java directory.

##Step for Server Creation
1. Download Code
2. Run java -jar .\swagger-codegen-cli.jar generate -i url/to/swagger.json -l nodejs-server -o .\server -t .\templates
3. cf login
4. cf push

##Create Jar
1. Download Source for Swagger Codegen 2.2.3 here https://github.com/swagger-api/swagger-codegen/releases/tag/v2.2.3
2. Substitute the Files in the project (.\swagger-codegen-2.2.3\modules\swagger-codegen\src\main\java\io\swagger\codegen\ and .\swagger-codegen-2.2.3\modules\swagger-codegen\src\main\java\io\swagger\codegen\languages) with the ones in the Java folder
3. Compile the project using Maven
4. Execute the Jar
5. Upload to Blumix using cf login and cf push
