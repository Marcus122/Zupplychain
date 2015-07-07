define(["jquery"],function($){
    
    return function Class(container, controlsContainer, thedatasource) {
    
        console.log("creating pager instance");
        var datasource = {};
        var $container = {}
        var $controlsContainer;
        var $generatedControlsContainer;
        var $clonedGeneratedControlsContainer;
        var currentPage = 0;
        var numPerPage = 0;
        var numPages = 0;
        var numActiveItems = 0; //number of items that *should* be displayed e.g. one's that aren't filtered out.
        var NUM_PER_PAGE_ATTRIBUTE = "data-loom-num-per-page";

        function init() {
            $container = container;
            $controlsContainer = controlsContainer;
            //read the num per page from the container element.
            getNumPerPage();
            console.log(numPerPage);
            if (numPerPage == 0) {
                //no paging so we're done!
                return;
            }
            //grab the datasource and store a reference.
            datasource = thedatasource;
            numActiveItems = datasource.numRows();
            deferPageControlOnClicks();
            generateControls();
            refreshView();
        }

        function deferPageControlOnClicks() {
            $(document).on("click", ".loom-paging-link a" , function(evt) {
                $that = $(evt.target);
                var index = parseInt($that.data("pageIndex"),10);
                currentPage = index;
                refreshView();
            });
            $(document).on("click", ".loom-paging-link-next a" , function(evt) {
                $that = $(evt.target);
                if (currentPage < numPages -1) {
                    currentPage++;
                }
                refreshView();
            });
            $(document).on("click", ".loom-paging-link-prev a" , function(evt) {
                $that = $(evt.target);
                if (currentPage > 0 ) {
                    currentPage--;
                }
                refreshView();
            })
            
        }

        function getNumPerPage() {
            var numPerPageValue = $container.attr(NUM_PER_PAGE_ATTRIBUTE);
            if (numPerPageValue) {
                numPerPage = parseInt(numPerPageValue);
            }
            if (isNaN(numPerPage)) {
                numPerPage = 0;
            }
        }

        function refreshView() {
            // hide any elements in the container not within the current page bounds.
            startItemIndex = currentPage * numPerPage;
            endItemIndex = startItemIndex + numPerPage;
            var rows = datasource.getRows();
            var lim = rows.length;
            for (var i = 0; i < lim; i++) {
                if (i >= startItemIndex && i < endItemIndex) {
                    rows[i].show();
                    continue;
                }
                rows[i].hide();
            }
            highlightActivePage();
        }
        
        function highlightActivePage() {
            $controlsContainer.find("a").removeClass("active");
            $controlsContainer.find("a[data-page-index='" + currentPage + "']").addClass("active");
        }
        
        function refreshAll() {
            currentPage = 0;
            numActiveItems = datasource.numRows();
            generateControls();
            refreshView();
        }

        function generateControls() {
            if (!$generatedControlsContainer) {
                $generatedControlsContainer = $("<ul class='loom-paging-container' />");
                $controlsContainer.prepend($generatedControlsContainer);
            }
            
            numPages = Math.ceil(numActiveItems / numPerPage);
            if (numPages < 2) {
                $generatedControlsContainer.remove();
                $generatedControlsContainer = "";
                return;
            }
            
            for (var i = 0; i < numPages; i++) {
                $thisElem = $("<li class='loom-paging-link'><a data-page-index='" + i + "'>" + (i+1) + "</a></li>");
                $generatedControlsContainer.append($thisElem);
            }
            $generatedControlsContainer.prepend("<li class='loom-paging-link-prev'><a> < </a></li>");
            $generatedControlsContainer.append("<li class='loom-paging-link-next'><a> > </a></li>");
            if ($clonedGeneratedControlsContainer) {
                $clonedGeneratedControlsContainer.remove();
            }
            $clonedGeneratedControlsContainer = $generatedControlsContainer.clone();
            $controlsContainer.append($clonedGeneratedControlsContainer);
        }
        
        init();
        if (numPerPage == 0) {//no paging;
            function doNothing() {
                return;
            }
            return {
                refreshView : doNothing,
                refreshAll : doNothing
            }
        
        }
        return {
                refreshView:refreshView, //re draws the view showing only active page items.
                refreshAll:refreshAll // regenerates paging controls, resets page to 1st, and redraws the view.
        }
    
    }
    
    

});
