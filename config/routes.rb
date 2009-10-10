ActionController::Routing::Routes.draw do |map|
  map.login '/login', :controller => :user_sessions, :action => :new
  map.login '/logout', :controller => :user_sessions, :action => :destroy
  map.login '/session', :controller => :user_sessions, :action => :create
  map.root :controller => :user_sessions
  
  map.resources :users
  map.resources :user_sessions
  map.resources :messages

  map.resources :inbox, :collection => {
    :sent => :get,
    :create_reply => :post
  }
end
