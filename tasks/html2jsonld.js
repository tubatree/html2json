var path = require('path');
var cheerio = require('cheerio');

module.exports = (grunt) => {

  grunt.registerMultiTask('html2json', 'Scrapes html files and converts them to json', function () { 
    var options = this.options();
    var done = this.async();
    var files = this.files.slice();
    
    if(files.length <= 0)
      throw new Error('no HTML files found');
      
    traverseFiles();

    function traverseFiles() {
      if (files.length <= 0) {
        done();
        return;
      }

      var file = files.pop();
      htmlToJson(file, options);
      traverseFiles();
    }
  });

  function getHtml(path)
  {
    return cheerio.load(grunt.file.read(path), {
	     withDomLvl1: true,
	     normalizeWhitespace: true,
	     xmlMode: true,
	     decodeEntities: true
	   });
  }

  function htmlToJson(file, options)
  {
     if(options.sections) {
	       $ = getHtml(file.src[0]);
	       var title = $('.layout h1 span').text(); 
	       var type = "Drug";
	       var sections = [];
	         [
		          ['cautions'],
		          ['contraIndications'],
		          ['nationalFunding'],
		          ['indicationsAndDoses'],
		          ['medicinalForms'],
		          ['sideEffects'],
		          ['directionsForAdministration'],
		          ['hepaticImpairment'],
		          ['prescribingAndDispensingInformations'],
		          ['importantSafetyInformations'],
		          ['renalImpairment'],
		          ['allergyAndCrossSensitivity'],
		          ['handlingAndStorages'],
		          ['professionSpecificInformation'],
		          ['breastfeeding'],
		          ['treatmentCessationInformation'],
		          ['patientAndCarerAdvice'],
		          ['monitoringRequirements'],
		          ['unlicensedUse'],
		          ['lessSuitableForPrescribings'],
		          ['effectsOnLaboratoryTests'],
		          ['interactions'],
		          ['drugAction'],
		          ['exceptionsToLegalCategory'],
		          ['preTreatmentScreeningInformation'],
		          ['pregnancy'],
		          ['conceptionAndContraception'],
	         ].forEach((x) => {
			       var anchor = '#'+x[0];
			       var section_heading = $(anchor+' h2').first();
		        if(section_heading.length){
				         var section_name = section_heading.text();
				         var body = $(anchor);
				         var inheritedTopics = body.find("[data-action=load]");
				         if(inheritedTopics.length) {
					           inheritedTopics.each(function() {
						             var html = getHtml(path.dirname(file.orig.cwd) + $(this).attr('href').replace(anchor, ''));
						             body.find($(this).attr('data-target')).append(html($(this).attr('data-filter')).text());
					           });
					           inheritedTopics.remove();
				         }		
				         var link = "http://bnf.nice.org.uk/drug/" + path.basename(file.src[0]) + anchor;
				         var section = { hasSearchLabel: title + " | " + section_name + " | "  + type, hasSearchLink: link, body: body.text() };
				         grunt.file.write(file.dest + anchor + '.json', JSON.stringify(section));
			       }
		       });
		    }
    }
};

