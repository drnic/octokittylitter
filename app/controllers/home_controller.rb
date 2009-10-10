class HomeController < ApplicationController
  def index
    redirect_to(inbox_index_path)
  end

end
