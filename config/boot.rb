require "logger"

ENV['BUNDLE_GEMFILE'] ||= File.expand_path('../Gemfile', __dir__)
require "bundler/setup" # Set up gems listed in the Gemfile.

if ENV['RAILS_ENV'] != 'production'
  require "bootsnap/setup" # Speed up boot time by caching expensive operations.
end

#require "bootsnap/setup" # Speed up boot time by caching expensive operations.
