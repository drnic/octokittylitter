ActionController::Routing::Routes.draw do |map|
  map.resources :messages

  map.resources :inbox, :collection => {
    :sent => :get,
    :create_reply => :post
  }
  map.root :controller => 'home', :action => 'index'
end
