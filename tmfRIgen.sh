#!/bin/bash

print_help () {
echo "This is the TMF-version of the swagger-code-generator! Based on a template structure it can create local of online NodesJS application from a Swagger file. Check that a Java >= Version 8 is installed on your machine. If an upload to the IBM Cloud is desired, the IBM Bluemix CLI has to be installed as well.

   -h	 	Help
   -s <ARG> 	Path/URL to a swagger file (mandatory)	 
   -l -b	Generate a l(ocal) or IBM b(luemix) application
		(one option is mandatory)
   -t <ARG> 	Path to a template folder (optional)
   -o <ARG>   Output to this directory"
exit 2
}

#Configuration Variables
GITHUB_CODEGEN=https://github.com/knutaa/tmfswaggergen/archive/master.zip

#Flags
FLAG_LOCAL=false
FLAG_BLUEMIX=false
SWAGGER_FILE=0
TEMPLATES=0
OUTPUTDIR=0

while getopts ":hlbt:s:o:" opt; do
  case $opt in
    h)
      print_help
      ;;
    l)
      FLAG_LOCAL=true
      ;;
    b)
      FLAG_BLUEMIX=true
      ;;
    t)
      TEMPLATES=$OPTARG
      echo $TEMPLATES
      ;;
    s)
      SWAGGER_FILE=$OPTARG
      echo $SWAGGER_FILE
      ;;
    o)
      OUTPUTDIR=$OPTARG
      ;;
    \?)
      echo "ERROR: Invalid option: -$OPTARG 

           " >&2
      print_help
      ;;
    :)
      echo "ERROR: Option -$OPTARG requires an argument.

           " >&2
      print_help
      ;;
  esac
done

# Ceck if both or no Deployment Flag is set
if [ $FLAG_LOCAL == $FLAG_BLUEMIX ] ; then
  echo "ERROR: Select one option. -l(ocal) or -b(luemix)." >&2
  print_help

# Check if the s flag and argument are set
elif [ $SWAGGER_FILE == 0 ] ; then
  echo "ERROR: Please enter an URL or a path to a Swaggerfile!" >&2
  print_help

# check if a custom folder for templates is selected, but the folder isn't existing
elif [ $TEMPLATES != 0 ] && ! [ -e $TEMPLATES ]  ; then
  echo "ERROR: Cannot find path to templates."
  print_help
fi

#Download codegenerator and default templates from GitHUB
if ! [ -e "github_tmf_codegen.zip" ] ; then
  curl -L https://github.com/knutaa/tmfswaggergen/archive/master.zip > github_tmf_codegen.zip
else 
  echo "using exisitng zip from github"
fi

# Extract the jar from the zip
if ! [ -e "tmf-swagger-codegen.jar" ] ; then
  unzip -p github_tmf_codegen.zip tmfswaggergen-master/tmf-swagger-codegen.jar > tmf-swagger-codegen.jar
else
  echo "using already downloade tmf-swagger-codegen.jar"
fi

# Extract the config.json from the zip if a local deployment is desired
if ! [ -e "config.json" ] ; then
  unzip -p github_tmf_codegen.zip tmfswaggergen-master/config.json > config.json
else
  echo "using already downloade tmf-swagger-codegen.jar"
fi

if [ $TEMPLATES == 0 ] ; then
  TEMPLATES="./templates"
  if ! [ -e "templates/" ] ; then
    mkdir templates
    cd templates
    unzip -j  ../github_tmf_codegen.zip 'tmfswaggergen-master/templates/*'
    cd ..
  else
    echo "using existing templates"
  fi
fi

sed -i "s/..\/service\/config.json/.\/config.json/g" $TEMPLATES'/service.mustache'
sed -i "s/.\/{{classname}}Service/..\/service\/{{classname}}Service/g" $TEMPLATES'/controller.mustache'

#Create a directory for the generated RI
if [ $OUTPUTDIR == 0 ] ; then
  OUTPUT="RI-"$(date +%Y%m%d-%T)
else
  OUTPUT=$OUTPUTDIR
fi
rm -rf $OUTPUT 
mkdir $OUTPUT


#Run the local generator
if [ "$FLAG_LOCAL" = true ] ; then
  java -jar ./tmf-swagger-codegen.jar generate -i $SWAGGER_FILE -l nodejs-server -o $OUTPUT -t $TEMPLATES -c ./config.json

fi


#Run Bluemix generator and upload it to the cloud
if [ "$FLAG_BLUEMIX" = true ] ; then
  java -jar ./tmf-swagger-codegen.jar generate -i $SWAGGER_FILE -l nodejs-server -o $OUTPUT -t $TEMPLATES
  cd $OUTPUT
  bx login -a https://api.ng.bluemix.net -o tmforum -s apidev
  bx cf push
fi

