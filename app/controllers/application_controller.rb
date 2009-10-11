# Filters added to this controller apply to all controllers in the application.
# Likewise, all the methods added will be available for all controllers.

class ApplicationController < ActionController::Base
  helper :all # include all helpers, all the time

  helper_method :current_user_session, :current_user
  
  protected
    def current_user_session
      return @current_user_session if defined?(@current_user_session)
      @current_user_session = UserSession.find
    end
    
    def current_user
      return @current_user if defined?(@current_user)
      @current_user = current_user_session && current_user_session.user
    end

    def require_user
      unless current_user
        if current_user_session && current_user_session.stale?
          flash[:notice] = "Your session has been logged out automatically"
        else
          flash[:error] = "You must be logged in to access this page"
        end

        store_location
        redirect_to new_user_session_url
        return false
      end
    end

    def store_location
      session[:return_to] = request.request_uri
    end

end
