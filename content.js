const STYLE_ELEMENT_ID = 'extension-custom-style-tag';

function injectStyle(cssText) {
  let styleEl = document.getElementById(STYLE_ELEMENT_ID);
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = STYLE_ELEMENT_ID;
    (document.head || document.documentElement).appendChild(styleEl);
  }
  styleEl.textContent = cssText;
}

chrome.storage.local.get(['customCss'], (data) => {
  if (data.customCss) {
    injectStyle(data.customCss);
  }
});

chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "applyStyle") {
    injectStyle(message.css);
  }
});


/////////////////////////////////// ADDITION MODULES ///////////////////////////////////

function initForumQuotes() {
  const commentControls = document.querySelectorAll('.ipsComment_controls');
  const toolList = document.querySelector('.ipsToolList.ipsToolList_horizontal.ipsClear.ipsClearfix.ipsJS_hide');
  
	if (toolList) {
		const getFromBufferButton = document.createElement('li');
		getFromBufferButton.className = '';
		getFromBufferButton.innerHTML = `<button type="button" class="ipsButton ipsButton_primary getFromBufferButton" id="exButtons" tabindex="3" accesskey="v" role="button">Вставить</button>`;
		toolList.append(getFromBufferButton);
	}

  commentControls.forEach(controls => {
    if (controls.querySelector('.closedThreadQuote')) return;

    const customQuoteButton 	= document.createElement('li');
    customQuoteButton.className = 'ipsJS_show';
    customQuoteButton.innerHTML = `<a class="closedThreadQuote" id="exButtons" href="#">Цитата+</a>`;
    
    controls.append(customQuoteButton);
  });
  
  ////////////////////////////////////// THREAD SCROLLING //////////////////////////////////////
  
  function setVisibleElement(element) {
	if (window.scrollY > 300) {
		element.style.setProperty('display', 'block', 'important');
	} else {
		element.style.setProperty('display', 'none', 'important');
	}
  }
    
  if (!document.getElementById('pageUpButton')) {
	const pageUpButton 		= document.createElement('button');
	pageUpButton.innerHTML 	= '▲';
	pageUpButton.id 		= 'pageUpButton';
	pageUpButton.className 	= 'ipsButton ipsButton_veryLight ipsButton_small';
    
	setVisibleElement(pageUpButton);
  
	pageUpButton.style.setProperty('position', 'fixed', 'important');
	pageUpButton.style.setProperty('bottom', '20px', 'important');
	pageUpButton.style.setProperty('right', '20px', 'important');
	pageUpButton.style.setProperty('border-radius', '50%', 'important');
	pageUpButton.style.setProperty('width', '50px', 'important');
	pageUpButton.style.setProperty('height', '50px', 'important');
	pageUpButton.style.setProperty('padding', '0', 'important');
  
	document.body.appendChild(pageUpButton);
  
	pageUpButton.addEventListener('click', (e) => {
		e.preventDefault();
		window.scrollTo({
			top: 0,
			behavior: 'smooth'
		});
	});
	
	window.addEventListener('scroll', () => {
		setVisibleElement(pageUpButton);
	});
  }
	//////////////////////////////////////////////////////////////////////////////////////////////
}

window.addEventListener('load', initForumQuotes);

document.addEventListener('click', (event) => {
  const quoteButton 	= event.target.closest('.closedThreadQuote');
  const bufferButton 	= event.target.closest('.getFromBufferButton');
  
  if (quoteButton) {
    event.preventDefault();
    
    const commentArticle = quoteButton.closest('article.ipsComment');
    
    if (!commentArticle) {
      console.error('Cannot found message container ' .ipsComment);
      return;
    }

	const commentContent 	= commentArticle.querySelector('.ipsContained').innerHTML;
	const commentData 		= commentArticle.querySelector('.ipsComment_content')?.getAttribute('data-quotedata') || '{}';
   
	console.log('Message has been saved');
	
	localStorage.setItem('lastQuoteMesasge', commentContent);
	localStorage.setItem('lastQuoteMeta', commentData);
	
	showAlert('Quote in local storage');
  }
  
  
  if (bufferButton) {
	  const jsonMeta 	= JSON.parse(localStorage.getItem('lastQuoteMeta'));
	  const message 	= localStorage.getItem('lastQuoteMesasge');
	  
	  console.log('Load data from localStorage...');
	  // console.log('Message:', message);
	  // console.log('Meta data:', jsonMeta);
	  
	  const editableArea = document.querySelector('.cke_wysiwyg_div.cke_reset.cke_enable_context_menu.cke_editable.cke_editable_themed.cke_contents_ltr');
	  let quoteMesasge = `<blockquote class="ipsQuote cke_widget_element" data-cke-widget-data="%7B%22classes%22%3A%7B%22ipsQuote%22%3A1%7D%7D" data-cke-widget-keep-attr="0" data-gramm="false" data-ipsquote="" data-ipsquote-contentapp="forums" data-ipsquote-contentclass="forums_Topic" data-ipsquote-contentcommentid="${jsonMeta.contentcommentid}" data-ipsquote-contentid="${jsonMeta.contentid}" data-ipsquote-contenttype="forums" data-ipsquote-timestamp="${jsonMeta.timestamp}" data-ipsquote-userid="${jsonMeta.userid}" data-ipsquote-username="${jsonMeta.username}" data-widget="ipsquote">
		<div class="ipsQuote_citation">${jsonMeta.username} сказал:</div>
		<div class="ipsQuote_contents ipsClearfix cke_widget_editable" contenteditable="true" data-cke-enter-mode="1" data-cke-widget-editable="content" data-gramm="false">
			${message}
		</div>
	</blockquote>`;
	
	// let handler = '<span class="cke_reset cke_widget_drag_handler_container" style="background: url(&quot;//forum.pandawow.me/applications/core/interface/ckeditor/ckeditor/plugins/widget/images/handle.png&quot;) rgba(220, 220, 220, 0.5); top: -15px; left: 0px;"><img class="cke_reset cke_widget_drag_handler" data-cke-widget-drag-handler="1" src="data:image/gif;base64,R0lGODlhAQABAPABAP///wAAACH5BAEKAAAALAAAAAABAAEAAAICRAEAOw==" width="15" title="Нажмите и перетащите, чтобы переместить" height="15" role="presentation"></span>';
	
	// Не рабатет DnD. Ебучий веб... TODO
	
	if (editableArea) {
		let divCount = editableArea.querySelectorAll('div').length + 1; 					// Рот ебал считать валидный id
		const insertedQuote = document.createElement('div');
		insertedQuote.className = 'cke_widget_wrapper cke_widget_block cke_widget_ipsquote cke_widget_wrapper_ipsQuote';
		insertedQuote.setAttribute('tabindex', '-1');
		insertedQuote.setAttribute('contenteditable', 'false');
		insertedQuote.setAttribute('data-cke-widget-wrapper', '1');
		insertedQuote.setAttribute('data-cke-filter', 'off');
		insertedQuote.setAttribute('data-cke-display-name', 'blockquote');
		insertedQuote.setAttribute('data-cke-widget-id', `${divCount}`);
		insertedQuote.setAttribute('role', 'region');
		insertedQuote.setAttribute('aria-label', 'blockquote виджет');
		insertedQuote.innerHTML = quoteMesasge;
		editableArea.append(insertedQuote);
	}
	
	// console.log(quoteMesasge);
  }
  
});

function showAlert(message) {
  const alertWidget 		= document.createElement('div');
  alertWidget.textContent 	= message;
  alertWidget.id 			= 'alertWidget';
  
  Object.assign(alertWidget.style, {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    padding: '12px 24px',
    borderRadius: '4px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    zIndex: '99999',
    fontFamily: 'sans-serif',
    fontSize: '14px',
    transition: 'opacity 0.3s ease, transform 0.3s ease',
    opacity: '0.5',
    transform: 'translateY(20px)'
  });

  document.body.appendChild(alertWidget);
  
  setTimeout(() => {
    alertWidget.style.opacity = '1';
    alertWidget.style.transform = 'translateY(0)';
  }, 10);

  setTimeout(() => {
    alertWidget.style.opacity = '0';
    alertWidget.style.transform = 'translateY(20px)';
    setTimeout(() => alertWidget.remove(), 300);
  }, 2500);
}

////////////////////////////////////////////

