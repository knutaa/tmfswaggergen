Param(
  [switch]$h,
  [switch]$l,
  [switch]$b,
  [string]$t,
  [string]$s
)

function print_help {
  echo "This is the TMF-version of the swagger-code-generator! Based on a template structure it can create local of online NodesJS application from a Swagger file. Check that a Java >= Version 8 is installed on your machine. If an upload to the IBM Cloud is desired, the IBM Bluemix CLI has to be installed as well.
   -h	 	Help
   -s <ARG> 	Path/URL to a swagger file (mandatory)
   -l -b	Generate a l(ocal) or IBM b(luemix) application
		(one option is mandatory)
   -t <ARG> 	Path to a template folder (optional)"
  exit 2
}

#Configuration Variables
$GITHUB_CODEGEN = "https://github.com/emanuelbearing/tmfswaggergen/archive/master.zip"


if($h){
  print_help
}

# Ceck if both or no Deployment Flag is set
if ( $l -eq $b ) {
  Write-Error "ERROR: Select one option. -l(ocal) or -b(luemix)."
  print_help
}
# Check if the s flag and argument are set
elseif (!$s) {
  Write-Error "ERROR: Please enter an URL or a path to a Swaggerfile!"
  print_help
}
# check if a custom folder for templates is selected, but the folder isn't existing
elseif($t -and ![System.IO.Directory]::Exists($t)) {
  Write-Error "ERROR: Cannot find path to templates."
  print_help
}

if(!$t) {
  $t = "./templates"
}


# Download codegenerator and default templates from GitHUB
if (![System.IO.File]::Exists("github_tmf_codegen.zip")) {
  echo "Download Generator and templates from GitHUB..."
  (New-Object System.Net.WebClient).DownloadFile("https://github.com/emanuelbearing/tmfswaggergen/archive/master.zip" ,  "github_tmf_codegen.zip")
  echo "... Download complete"
}
else {
  echo "using existing zip"
}

if ( ![System.IO.File]::Exists("tmf-swagger-codegen.jar") -Or ![System.IO.File]::Exists("config.json") -Or ![System.IO.Directory]::Exists("templates")) {
  #Extract zip
  Expand-Archive -LiteralPath .\github_tmf_codegen.zip -DestinationPath .\extract

  # Extract the jar from the zip
  if (![System.IO.File]::Exists("tmf-swagger-codegen.jar")) {
    Copy-Item -Path extract\tmfswaggergen-master\tmf-swagger-codegen.jar -Destination .\tmf-swagger-codegen.jar
  }
  else {
    echo "using already download tmf-swagger-codegen.jar"
  }

  # Extract the config.json from the zip
  if (![System.IO.File]::Exists("config.json")) {
    Copy-Item -Path extract\tmfswaggergen-master\config.json -Destination .\config.json
  }
  else {
    echo "using already download config.json"
  }

  # Extract templates from the zip
  if ( ![System.IO.Directory]::Exists("templates")) {
    mkdir templates
    Copy-Item -Path extract\tmfswaggergen-master\templates\* -Destination .\templates\

    #I need the following two lines to, since the generator under Windows seems to create the "Service" files in the controlle directory
    (Get-Content .\templates\controller.mustache) -replace '../service/', './' | Set-Content .\templates\controller.mustache
    (Get-Content .\templates\service.mustache) -replace './config.json', '../service/config.json' | Set-Content .\templates\service.mustache

  }
  else {
    echo "using existing templates"
  }

  # Remove extracted folder
  rm -r extract

}


#Create a directory for the generated RI
$output = Get-Date -UFormat "%Y%m%d-%H%M%S"
$output = "RI-"+$output
echo $output
mkdir $output


#Run the local generator
if ($l) {
  java -jar ./tmf-swagger-codegen.jar generate -i $s -l nodejs-server -o $output -t $t -c ./config.json
}


#Run Bluemix generator and upload it to the cloud
if ($b) {
  java -jar ./tmf-swagger-codegen.jar generate -i $s -l nodejs-server -o $output -t $t
  cd $OUTPUT
  bx login -a https://api.ng.bluemix.net -o tmforum -s apidev
  bx cf push
}
