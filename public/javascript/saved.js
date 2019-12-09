$(document).ready(function() {
	var articleContainer = $('.article-container');
	$(document).on('click', '.btn.delete', removeFromSaved);
	$(document).on('click', '.btn.notes', handleNotes);
	$(document).on('click', '.btn.save', handleNoteSave);
	$(document).on('click', '.btn.note-delete', handleNoteDelete);

	$('.clear').on('click', handleArticleClear);
	console.log('hello world');
	function initPage() {
		$.get('/articles?saved=true').then(function(data) {
			articleContainer.empty();
			if (data && data.length) {
				renderArticles(data);
			} else {
				renderEmpty();
			}
		});
	}

	function handleNotes(event) {
		var currentArticle = $(this).parents('.card').data();
		$.get('/api/notes/' + currentArticle._id).then(function(data) {
			var modalText = $("<div class='container-fluid text-center'>").append(
				$('<h4>').text('Notes For Article: ' + currentArticle._id),
				$('<hr>'),
				$("<ul class='list-group note-container'>"),
				$("<textarea placeholder='New Note' rows='4' cols='60'>"),
				$("<button class='btn btn-success save'>Save Note</button>")
			);
			bootbox.dialog({
				message: modalText,
				closeButton: true
			});
			var noteData = {
				_id: currentArticle._id,
				notes: data || []
			};
			$('.btn.save').data('article', noteData);
			renderNotesList(noteData);
		});
	}

	function handleNoteSave() {
		var noteData;
		var newNote = $('.bootbox-body textarea').val().trim();
		if (newNote) {
			noteData = { _headlineId: $(this).data('article')._id, noteText: newNote };
			$.post('/api/notes', noteData).then(function() {
				bootbox.hideAll();
			});
		}
	}

	function handleNoteDelete() {
		var noteToDelete = $(this).data('_id');
		$.ajax({
			url: '/api/notes/' + noteToDelete,
			method: 'DELETE'
		}).then(function() {
			bootbox.hideAll();
		});
	}

	function renderNotesList(data) {
		var notesToRender = [];
		var currentNote;
		if (!data.notes.length) {
			currentNote = $("<li class='list-group-item'>No notes for this article yet.</li>");
			notesToRender.push(currentNote);
		} else {
			for (var i = 0; i < data.notes.length; i++) {
				currentNote = $("<li class='list-group-item note'>")
					.text(data.notes[i].noteText)
					.append($("<button class='btn btn-danger note-delete'>x</button>"));
				currentNote.children('button').data('_id', data.notes[i]._id);
				notesToRender.push(currentNote);
			}
		}
		$('.note-container').append(notesToRender);
	}

	function renderArticles(articles) {
		var articleCards = [];
		for (var i = 0; i < articles.length; i++) {
			articleCards.push(createCard(articles[i]));
		}
		articleContainer.append(articleCards);
	}

	function createCard(article) {
		console.log(article);
		var card = $("<div class='card'>");
		var cardHeader = $("<div class='card-header'>").append(
			$('<h3>').append(
				$("<a class='article-link' target='_blank' rel='noopener noreferrer'>")
					.attr('href', article.URL)
					.text(article.headline),
			)
		);

		var cardBody = $("<div class='card-body'>").text(article.summary);
		var btnDel = $("<div class='card-body'><a class='btn btn-outline-secondary delete'>Delete Article</a>")

		card.append(cardHeader, cardBody, btnDel);
		card.data('_id', article._id);
		return card;
	}

	function renderEmpty() {
		var emptyAlert = $(
			[
				"<div class='alert text-center'>",
				"<h4>No Saved Articles.</h4>",
				"</div>",
				"<div class='card'>",
				"<div class='card-body text-center'>",
				"<h4><a class='go-home' href='/'>Go to Home</a></h4>",
				"</div>",
				"</div>"
			].join('')
		);
		articleContainer.append(emptyAlert);
	}

	function removeFromSaved() {
		var articleToUnSave = $(this).parents('.card').data();
		$(this).parents('.card').remove();

		articleToUnSave.saved = false;
		$.ajax({
			method: 'PUT',
			url: '/articles/' + articleToUnSave._id,
			data: articleToUnSave
		}).then(function(data) {
			if (data.saved === false) {
				initPage();
			}
		});
	}

	function handleArticleClear() {
		$.get('api/clear').then(function() {
			articleContainer.empty();
			initPage();
		});
	}
	initPage();
});
