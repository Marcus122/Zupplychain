define(["jquery"],function($){
    
    return function Class(container, controlsContainer, thedatasource, theNumPerPage) {
    
        var datasource = {};
        var $container = {}
        var $controlsContainer; 
        var $generatedControlsContainer;
        var $clonedGeneratedControlsContainer;
        var currentPage = 0;
        var numPerPage = theNumPerPage;
        var numPages = 0;
        var numActiveItems = 0; //number of items that *should* be displayed e.g. one's that aren't filtered out.

        function init() {
            $container = container;
            $controlsContainer = controlsContainer;
            if (numPerPage == 0) {
                return; //no paging so we're done!
            }
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
                } else {
                    currentPage = 0;
                }
                refreshView();
            });
            $(document).on("click", ".loom-paging-link-prev a" , function(evt) {
                $that = $(evt.target);
                if (currentPage > 0 ) {
                    currentPage--;
                } else {
                    currentPage = numPages - 1;
                }
                refreshView();
            })
            
        }



        function refreshView() {
            $container.empty();
            startItemIndex = currentPage * numPerPage;
            endItemIndex = startItemIndex + numPerPage;
            var rows = datasource.getRows();
            var lim = rows.length;
            for (var i = 0; i < lim; i++) {
                if (i >= startItemIndex && i < endItemIndex) {
                    $container.append(rows[i].getElement()); 
                    continue;
                } 
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

        function resetToFirstPage(){
            currentPage = 0;
            refreshView();    
        }
        
        function generateControls() {
            $controlsContainer.find(".loom-paging-container").remove();
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
            function doNothing() { return; }
            return {
                refreshView : doNothing,
                refreshAll : doNothing,
                resetToFirstPage: doNothing
            }
        
        }
        return {
                refreshView:refreshView, //re draws the view showing only active page items.
                refreshAll:refreshAll, // regenerates paging controls, resets page to 1st, and redraws the view.
                resetToFirstPage:resetToFirstPage
        }
    
    }
    
    

});
