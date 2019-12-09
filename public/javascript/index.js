$(document).ready(function() {
	var articleContainer = $('.article-container');
	$(document).on('click', '.btn.save', handleArticleSave);
	$(document).on('click', '.scrape-new', handleArticleScrape);
	$('.clear').on('click', handleArticleClear);

	function initPage() {
		$.get('/articles?saved=false').then(function(data) {
			articleContainer.empty();
			if (data && data.length) {
				renderArticles(data);
			} else {
				renderEmpty();
			}
		});
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
		var btn = $("<div class='card-body'><a class='btn btn-outline-secondary save'>Save Article</a>")

		card.append(cardHeader, cardBody, btn);
		card.data('_id', article._id);
		return card;
	}

	function renderEmpty() {
		var emptyAlert = $(
			[
				"<div class='alert text-center'>",
				"<h4>No New Articles.</h4>",
				"</div>",
				"<div class='card'>",
				"<div class='card-body text-center'>",
				"<h4><a class='scrape-new'>Scrape New Articles</a></h4>",
				"<h4><a href='/saved'>Go to Saved Articles</a></h4>",
				"</div>",
				"</div>"
			].join('')
		);
		articleContainer.append(emptyAlert);
	}

	function handleArticleSave() {
		var articleToSave = $(this).parents('.card').data();
		console.log(articleToSave);
		$(this).parents('.card').remove();

		articleToSave.saved = true;
		$.ajax({
			method: 'PUT',
			url: '/articles/' + articleToSave._id,
			data: articleToSave
		}).then(function(data) {
			if (data.saved) {
				initPage();
			}
		});
	}

	function handleArticleScrape() {
		$.get('/scrape').then(function(data) {
			initPage();
			bootbox.alert($("<h3 class='text-center m-top-80'>").text(data.message));
			console.log('Scraping');
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