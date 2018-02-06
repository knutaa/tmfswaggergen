#!/bin/bash
#copy the modified java source files to create TMF version
cp ~/codegen/swagger-codegen-2.3.1/modules/swagger-codegen/src/main/java/io/swagger/codegen/languages/NodeJSServerCodegen.java ./java/
cp ~/codegen/swagger-codegen-2.3.1/modules/swagger-codegen/src/main/java/io/swagger/codegen/DefaultCodegen.java ./java/
cp ~/codegen/swagger-codegen-2.3.1/modules/swagger-codegen/src/main/java/io/swagger/codegen/CodegenOperation.java ./java/
cp ~/codegen/swagger-codegen-2.3.1/modules/swagger-codegen/src/test/java/io/swagger/codegen/options/NodeJSServerOptionsProvider.java ./java/
cp ~/codegen/swagger-codegen-2.3.1/modules/swagger-codegen/src/test/java/io/swagger/codegen/nodejs/NodeJSServerOptionsTest.java ./java/

#copy compiled jar to repo
cp ~/codegen/swagger-codegen-2.3.1/modules/swagger-codegen-cli/target/swagger-codegen-cli.jar ./tmf-swagger-codegen.jar

echo "Copying complete!"
