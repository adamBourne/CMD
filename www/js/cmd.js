// file stuff; 

function gotFS(fileSys) {
    // save the file system for later access
    window.rootFS = fileSys.root;
}

function fail(err){
	alert(err)
}

document.addEventListener('deviceready', function() { 
	//var props = []; for (var prop in window){props.push(prop)}; props.sort(); alert(props); 
	try{
	window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;
	window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotFS, fail); 
	}catch(e){alert(e)}
}, false);


// CMD functions

// CMD stuff; 

	var CMD = {
		CURRENT_DIR: '/',  
		echo: function(msg){
			return msg; 
		}, 
		help: function(){
			var helpMonologue = []; 
			for (var prop in window.CMD){
				helpMonologue.push(prop); 
			}
			return helpMonologue + ''; 
		}, 
		mkdir: function(dirName){ // create a new directory; 
			function gotDir(dirEntry) {
				alert('created dir: ' + dirName); 
			}
			function gotFS(fileSystem) {
				fileSystem.root.getDirectory(dirName, {create: true}, gotDir);
			}; 
			window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotFS, fail);
		},
		rmdir: function(fullpath){
			/* {"description": "remove directory by path string"} */
			function fail(evt) {
				alert("FILE SYSTEM FAILURE" + evt.target.error.code);
			}; 
			function onFileSystemSuccess(fileSystem) {
				fileSystem.root.getDirectory(
					fullpath,
					{create : true, exclusive : false},
					function(entry) {
					entry.removeRecursively(function() {
						alert("Remove Recursively Succeeded");
					}, fail);
				}, fail);
			}; 
			window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, onFileSystemSuccess, fail);
		}, 
		cd: function(path){ 
			/*
				{"description": "change to new directory by path"}
			*/
			try{
			var cmdLine = this; 
			window.requestFileSystem(
				LocalFileSystem.PERSISTENT, 
				0, 
				function(fileSystem) { // got filesystem; 
					fileSystem.root.getDirectory( 
						path, 
						{
						   create: true
						}, 
						function(directory) {
							var directoryReader = directory.createReader();
							directoryReader.readEntries(
								function(entries) {
									CMD.CURRENT_DIR = path;  
									addOutput(cmdLine, 'path = "' + path + '", entries = ' + entries); 
									//alert('success')
								}, 
								function (error) {
									alert(error.code)
								}
							);
						} 
					);
				}, 
				function(error) {
					alert(error.code)
					//addErrorMessage(cmdLine, error.code)
				}
			);
			}catch(e){alert(e)}
		},  
		dir: function(){
			var cmdLine = this; 
			window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem) {
			   fileSystem.root.getDirectory(window.CMD.CURRENT_DIR, {
					   create: true
				   }, function(directory) {

					var directoryReader = directory.createReader();
					directoryReader.readEntries(function(entries) {
						var i, msg = [];
						for (i=0; i<entries.length; i++) {
							msg.push(entries[i].fullPath); 
						}
						msg = msg.join('\n'); 
						//alert(this); 
						addOutput(cmdLine, msg); 
					}, function (error) {
						addErrorMessage(cmdLine, error.code)
					});

				   } );
			}, function(error) {
			   addErrorMessage(cmdLine, error.code)
			});
		}, 
		read: function(filename){ 
			/*
				get and display contents of file
			*/
			var cmdLine = this; 
			window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, 
				function(fileSystem) { // got file system; 
					fileSystem.root.getFile(filename, null, 
						function(fileEntry){ // get fileEntry by filename; 
							fileEntry.file(
								function(file){ // got file object
									var reader = new FileReader();
									reader.onloadend = function(evt) { // read file data; 
										addOutput(cmdLine, evt.target.result);
									};
									reader.readAsText(file);
								}, 
								function(err){ // failed to get file object; 
									alert(err); 
								}
							);
						}, function(err){ // failed to get file
							alert(err); 
						}
					);
				}, 
				function(err){ // failed to get file system; 
					alert(err); 
				}
			)
		}, 
		write: function(filename, data){ 
			/* Create/write to file. Parameters: filename, data */
		    window.requestFileSystem(
				LocalFileSystem.PERSISTENT, 
				0, 
				function(fileSystem) { // got file system; 
					fileSystem.root.getFile(
						filename, 
						{create: true}, 
						function(fileEntry){ // got file entry; 
							fileEntry.createWriter(
								function (writer){ // got fileWriter; 
									// write to file; 
									writer.onwriteend = function(evt) { 
									};
									writer.write(data);
								}, 
								function (err){ // failed to create fileWriter; 
									alert(err); 
								}
							);
						}
					), 
					function (err){ // failed to get file; 
						alert(err); 
					}
				}, 
				function(err){ // failed to get file system; 
					alert(err)
				}
			);
		}, 
		start: function(filename){
			/* open file. Parameters: filename */
			var cmdLine = this; 
			// read file data; 
			window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, 
				function(fileSystem) { // got file system; 
					fileSystem.root.getFile(filename, null, 
						function(fileEntry){ // get fileEntry by filename; 
							fileEntry.file(
								function(file){ // got file object
									var reader = new FileReader();
									reader.onloadend = function(evt) { // read file data; 
										//addOutput(cmdLine, evt.target.result); 
										var url = evt.target.result; 
										window.open(url, filename, "menubar=yes, scrollbars=yes, status=yes, titlebar=yes, toolbar=yes"); 
									};
									reader.readAsDataURL(file);
								}, 
								function(err){ // failed to get file object; 
									alert(err); 
								}
							);
						}, function(err){ // failed to get file
							alert(err); 
						}
					);
				}, 
				function(err){ // failed to get file system; 
					alert(err); 
				}
			)
		}, 
		download: function(requestURL, filename){
			/* download file from web. Parameters: requestURL (e.g. "http://www.example.com") */
			window.requestFileSystem(LocalFileSystem.PERSISTENT, 0,
				function(fileSystem) {
					var directoryEntry = fileSystem.root; // to get root path to directory
					var rootdir = fileSystem.root;
					var fp = 'cdvfile://localhost/persistent/'//rootdir.fullPath;
					fp = fp + filename;
					alert("downloading: " + requestURL + " to " + fp);
					var fileTransfer = new FileTransfer();
					alert("downloading: " + requestURL + " to " + fp);
					fileTransfer.download(
						encodeURI(requestURL),
						fp,
						function(theFile) {
							alert("download complete: " + theFile.toURI());
							//loadPDF(theFile.toURI(), y,x, canvasid, wrapperid);
						},function(error) {
							alert("error: " + JSON.stringify(error));
						}
					);
				}, 
				function(arg) { 
					alert("FAIL ON requestFileSystem" + JSON.stringify(arg)); 
				}
			);			
		},
		help: function(){ 
			/* Get help doc for commands */
			var helpString = '', keys = Object.keys(CMD).sort(); 
			
			for (var n = 0; n < keys.length; n ++){ 
				var functionName = keys[n]; 
				if (functionName == 'help'){continue}; 
				var func = CMD[functionName], funcString = func + ''; 
				var helpStartIndex = funcString.indexOf('/*'), helpEndIndex = funcString.indexOf('*/'), thisHelp = ''; 
				
				while (helpStartIndex > -1 && helpEndIndex > -1 && helpEndIndex > helpStartIndex){
					var newLine = funcString.substring(helpStartIndex + 2, helpEndIndex).trim(); // get next line between /* ... */

					
					thisHelp += '\t' + newLine + '\n'; 
					
					funcString = funcString.substring(helpEndIndex + 2); // remove last found help quoted between delimiters 
					helpStartIndex = funcString.indexOf('/*'), helpEndIndex = funcString.indexOf('*/'); 
				}
				
				helpString += functionName + ': \n' + thisHelp + '\n'; 
			}; 
			helpString += "\n"
			return helpString; 
		}				
		
	}
	function cmdOninput(ev, textareaNode){ 
		// deal with oddity that text area oninput fires upon it being created it appears that carriage return from previous input fires in newly created one, so remove the whitespace created by the carriage return?! 
		var value = textareaNode.value, isOnlyWhiteSpace = /^\s+$/.test(value)
		if (isOnlyWhiteSpace){textareaNode.value = ''; }
		
	    textareaNode.style.height = "1em";
        textareaNode.style.height = (textareaNode.scrollHeight)+"px";
		
	}

	// add command line functionality; 
	function cmdOnkeyup(ev, textareaNode){

		if (ev.keyCode != 13){ // if not a return; 
			return
		}; 
		
		
		var value = textareaNode.value; 
		// break up into function name and parameters; 
		var parametersArray = value.split(' '), funcName = parametersArray.shift(); 
			
		var parsedParameters = []; 
		for (var n = 0; n < parametersArray.length; n ++){
			var parameter = parametersArray[n], firstChar = parameter.charAt(0), lastChar = parameter.slice(-1); 
			if (firstChar == "'" && lastChar == "'" || firstChar == '"' && lastChar == '"'){
				parameter = parameter.slice(1, -1); 
			}
			else {
				parameter = window[parameter]; // variable with that name; 
			}
			parsedParameters.push(parameter); 
		}

		var cmd = document.querySelector('.CMD'); 
		var cmdLine = textareaNode.parentNode; 
		
		try {
			var func = CMD[funcName]; 
			textareaNode.func = func; 
			var returnValue = func.apply(cmdLine, parsedParameters); // execute line passing cmdLine node as the 'this' keyword; 
			(returnValue != undefined) && addOutput(cmdLine, returnValue); 
		}catch(err){
			addErrorMessage(cmdLine, err)
		}
	
		addCMDLine(cmd); 	
	}; 
	
	function addCMDLine(cmd){
		cmd = cmd || document.querySelector('.CMD'); 
		var newLine = document.querySelector('.template>.CMDLine').cloneNode(true); 
		var prompt = newLine.querySelector('.prompt'); 
		prompt.innerHTML = CMD.CURRENT_DIR + '$&nbsp'; 

		cmd.appendChild(newLine); // append after input line; 

		var valueNode = newLine.querySelector('.value'); 
		
		valueNode.focus(); 
	}

	function addOutput(cmdLine, value){
		var newLine = document.querySelector('.template>.CMDOutput').cloneNode(true); 
		cmdLine.parentNode.insertBefore(newLine, cmdLine.nextSibling); // append after input line; 
		
		var valueNode = newLine.querySelector('.value'); 

		valueNode.value = value; 
		valueNode.style.height = "1em";
        valueNode.style.height = (valueNode.scrollHeight) + "px"; 
	}
	
	function addErrorMessage(cmdLine, value){
		var newLine = document.querySelector('.template>.CMDErrorMessage').cloneNode(true); 
		cmdLine.parentNode.insertBefore(newLine, cmdLine.nextSibling); // append after input line; 
		
		var valueNode = newLine.querySelector('.value'); 

		valueNode.value = value; 
		valueNode.style.height = "1em";
        valueNode.style.height = (valueNode.scrollHeight) + "px"; 
	}
	
	
	
	
	
	
	
	
	
	
	
	
	
	
// file manager functions; 
	
var FileManager = {
	
	getDirContentsArray: function(dirPath, callback){ // callback(thisNode, namesArray)
			dirPath = dirPath || '/'; 
			var thisNode = this; 
			window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem) {
			   fileSystem.root.getDirectory(dirPath, {
					   create: true
				   }, function(directory) {

					var directoryReader = directory.createReader();
					directoryReader.readEntries(function(entries) {
						var i, dirObj = {};
						for (i = 0; i < entries.length; i++) {
							//names.push(entries[i].fullPath); 
							var entry = entries[i]; 
							dirObj[entry.name] = {isFile: entry.isFile, fullPath: entry.fullPath}//entry; 
						} 
						callback(thisNode, dirObj); 
					}, function (error) {
						alert(error.code)
				});
		   } );
		}, function(error) {
			   alert(error.code)
		});
	}
}