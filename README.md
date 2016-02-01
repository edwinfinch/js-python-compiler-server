# pythoncompiler-server
Server for the iOS "python compiler" for my TEJ4M culminating.

It's not 100% complete as I was in the middle of writing in the file fetcher when I had to submit, which actually might be a blessing in disguise because now you get the chance to finish it for yourself :)

<h2>Setup</h2>
<h3>Installation</h3>

You should run this off of a Raspberry Pi or Linux server with at least 128mb of RAM and an internet connection. For this setup, the setup will be for an Ubuntu 14.04 LTS server.

<h4>Requirements</h4>
For this project to run, you need:
<ul>
  <li><a href="https://www.mongodb.org/">MongoDB</a></li>
  <li><a href="https://nodejs.org/en/">Node.js</a></li>
  <li><a href="https://www.python.org/">Python 2.7.9 or 3.x (we ran 2.7.9)</a></li>
</ul>

Once you have installed all 3 of these, you will be able to run the server.

<h4>Setting Up</h4>
Setting up the server is relatively easy! Just copy all of the contents of this repository into your own folder.

Run `mkdir scripts` from within the server folder you've imported this repository into, this is where scripts are inputted into. If you don't do this, you may be presented with EONENT or other file access errors.

<h2>Running</h2>
Make sure your node script is not running in root. Give it proper permissions, and run `nodejs server.js`. You should see a confirmation: `Culminating server running on port 5000!`

<h2>Issues</h2>
Should you have any questions, issues, or comments, please let me know my emailing me: edwin (at) lignite.io.

<h2>Pull Requests and Contributions</h2>
Feel free to make any pull requests and contributions as you wish, and I will review them :)

Enjoy!