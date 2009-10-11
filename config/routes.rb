ActionController::Routing::Routes.draw do |map|
  map.root :controller => :user_sessions
  map.login 'login', :controller => :user_sessions, :action => :new
  map.logout 'logout', :controller => :user_sessions, :action => :destroy
  map.session 'session', :controller => :user_sessions, :action => :create
  map.register 'signup/free', :controller => :users, :action => :new
  
  map.resources :users
  map.resources :user_sessions
  map.resources :messages

  map.resources :inbox, :collection => {
    :sent => :get,
    :seed => :get,
    :create_reply => :post,
    :delete_messages => :post
  }
end
