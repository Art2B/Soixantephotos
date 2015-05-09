var Main = (function(my, Config){
  
  my.initGA = function(){
   !function(A,n,g,u,l,a,r){A.GoogleAnalyticsObject=l,A[l]=A[l]||function(){
   (A[l].q=A[l].q||[]).push(arguments)},A[l].l=+new Date,a=n.createElement(g),
   r=n.getElementsByTagName(g)[0],a.src=u,r.parentNode.insertBefore(a,r)
   }(window,document,'script','//www.google-analytics.com/analytics.js','ga');

   ga('create', Config.ga.id);
   ga('send', 'pageview');
  };

  my.init = function(){
    my.initGA();
  };
  return my;
}(Main || {}, Config || {}));