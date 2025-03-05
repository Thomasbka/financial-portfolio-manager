module Api
  class TrackersController < ApplicationController
    def index
      @trackers = Tracker.all
      render json: @trackers
    end

    def show
      @tracker = Tracker.find(params[:id])
      render json: @tracker
    end

    def create
      @tracker = Tracker.new(tracker_params)
      if @tracker.save
        render json: @tracker, status: :created
      else
        render json: @tracker.errors, status: :unprocessable_entity
      end
    end

    def update
      @tracker = Tracker.find(params[:id])
      if @tracker.update(tracker_params)
        render json: @tracker
      else
        render json: @tracker.errors, status: :unprocessable_entity
      end
    end

    def destroy
      @tracker = Tracker.find(params[:id])
      @tracker.destroy
      head :no_content
    end

    private

    def tracker_params
      params.require(:tracker).permit(:user_id, :symbol, :sentiment, :technical)
    end
  end
end
