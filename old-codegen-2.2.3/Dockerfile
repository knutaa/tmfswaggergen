FROM registry.ng.bluemix.net/ibmnode:latest
COPY ./ trouble
WORKDIR trouble
RUN npm install -d --production
EXPOSE 8080
ENV PORT 8080
ENV DOCKER true
CMD ["node", "index.js"]
