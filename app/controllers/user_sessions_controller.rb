class UserSessionsController < ApplicationController
  layout "public"

  def create
    @user_session = UserSession.new(:login => params[:login], :password => params[:password])
    if @user_session.save
      redirect_to(inbox_index_path)
    else
      flash.now[:error] = 'Incorrect login or password.'
      render :action => "new"
    end
  end
  
  def destroy
    @user_session = UserSession.find
    @user_session.destroy
    redirect_to root_url
  end
end
