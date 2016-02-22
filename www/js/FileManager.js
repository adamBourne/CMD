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
	}, 

	start: function(filename){
		/* open file. Parameters: filename */
		//var cmdLine = this; 
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
		})
	}
}