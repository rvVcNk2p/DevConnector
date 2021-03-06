const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');
const request = require('request');
const config = require('config');

const Profile = require('../../models/Profile');
const Post = require('../../models/Post');
const User = require('../../models/User');

//  @route  GET api/profile/me
//  @desc   Get current users profile
//  @access Private

router.get('/me', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id }).populate(
      'user',
      ['name, avatar']
    );

    if (!profile) {
      return res.status(400).json({ msg: 'There is no profile for this user' });
    }

    res.json(profile);
  } catch (err) {
    console.log(err.message);
    res.status(500).send('Server Error');
  }
});

//  @route  POST api/profile
//  @desc   Create or update user profile
//  @access Private
router.post(
  '/',
  [
    auth,
    [
      check('status', 'Status is required.').notEmpty(),
      check('skills', 'Skills is required').notEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      company,
      website,
      location,
      bio,
      status,
      githubusername,
      skills,
      youtube,
      facebook,
      twitter,
      instagram,
      linkedin
    } = req.body;

    // build profile Obj
    const profileFileds = {};
    profileFileds.user = req.user.id;

    if (status) profileFileds.status = status;
    if (company) profileFileds.company = company;
    if (website) profileFileds.website = website;
    if (location) profileFileds.location = location;
    if (bio) profileFileds.bio = bio;
    if (githubusername) profileFileds.githubusername = githubusername;
    if (skills) {
      if (typeof skills === 'string') {
        profileFileds.skills = skills.split(',').map(skill => skill.trim());
      } else {
        profileFileds.skills = skills;
      }
    }
    // Build social Obj
    profileFileds.social = {};
    if (youtube) profileFileds.social.youtube = youtube;
    if (twitter) profileFileds.social.twitter = twitter;
    if (facebook) profileFileds.social.facebook = facebook;
    if (linkedin) profileFileds.social.linkedin = linkedin;
    if (instagram) profileFileds.social.instagram = instagram;

    try {
      let profile = await Profile.findOne({ user: req.user.id });

      if (profile) {
        // Update
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFileds },
          { new: true }
        );
        return res.json(profile);
      }

      // Create
      profile = new Profile(profileFileds);
      await profile.save();
      res.json(profile);
    } catch (err) {
      console.log(err.message);
      res.status(500).send('Server Error');
    }
  }
);

//  @route  GET api/profile
//  @desc   Get all profiles
//  @access Public
router.get('/', async (req, res) => {
  try {
    const profiles = await Profile.find().populate('user', ['name', 'avatar']);
    res.json(profiles);
  } catch (error) {
    console.log(error.message);
    res.status(500).send('Server Error');
  }
});

//  @route  POST api/profile/user/:user_id
//  @desc   Get profile by ID
//  @access Public
router.get('/user/:user_id', async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.user_id
    }).populate('user', ['name', 'avatar']);

    if (!profile) {
      return res.status(400).json({ msg: 'No profile for this user' });
    }

    res.json(profile);
  } catch (error) {
    console.log(error.message);
    if (error.kind == 'ObjectId') {
      return res.status(400).json({ msg: 'Profile not found.' });
    }
    res.status(500).send('Server Error');
  }
});

//  @route  DELETE api/profile
//  @desc   Delete profile, user & posts
//  @access Private
router.delete('/', auth, async (req, res) => {
  try {
    // Remove user posts
    await Post.deleteMany({ user: req.user.id });
    // Remove profile
    await Profile.findOneAndRemove({ user: req.user.id });
    // Remove user
    await User.findOneAndRemove({ _id: req.user.id });
    res.json({ msg: 'User deleted' });
  } catch (error) {
    console.log(error.message);
    res.status(500).send('Server Error');
  }
});

//  @route  PUT api/profile/experience
//  @desc   Add profile experience
//  @access Private
router.put(
  '/experience',
  [
    auth,
    [
      check('title', 'Title is required')
        .not()
        .isEmpty(),
      check('company', 'Company is required')
        .not()
        .isEmpty(),
      check('from', 'from date is required')
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      company,
      location,
      from,
      to,
      current,
      description
    } = req.body;

    const newExp = {
      title,
      company,
      location,
      from,
      to,
      current,
      description
    };

    try {
      const profile = await Profile.findOne({ user: req.user.id });
      profile.experience.unshift(newExp);
      await profile.save();
      res.json(profile);
    } catch (error) {
      console.log(error.message);
      res.status(500).send('Server Error');
    }
  }
);

//  @route  DELETE api/profile/experience/:exp_id
//  @desc   Delete expereince from profile
//  @access Private
router.delete('/experience/:exp_id', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    const removeIndex = profile.experience
      .map(exp => exp.id)
      .indexOf(req.params.exp_id);

    profile.experience.splice(removeIndex, 1);

    await profile.save();

    res.json(profile);
  } catch (error) {
    console.log(error.message);
    res.status(500).send('Server Error');
  }
});

//  @route  PUT api/profile/education
//  @desc   Add profile education
//  @access Private
router.put(
  '/education',
  [
    auth,
    [
      check('school', 'School is required')
        .not()
        .isEmpty(),
      check('degree', 'Degree is required')
        .not()
        .isEmpty(),
      check('fieldofstudy', 'Field of study is required')
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description
    } = req.body;

    const newEdu = {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description
    };

    try {
      const profile = await Profile.findOne({ user: req.user.id });
      profile.education.unshift(newEdu);
      await profile.save();
      res.json(profile);
    } catch (error) {
      console.log(error.message);
      res.status(500).send('Server Error');
    }
  }
);

//  @route  DELETE api/profile/education/:edu_id
//  @desc   Delete education from profile
//  @access Private
router.delete('/education/:edu_id', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    const removeIndex = profile.education
      .map(exp => exp.id)
      .indexOf(req.params.edu_id);

    profile.education.splice(removeIndex, 1);

    await profile.save();

    res.json(profile);
  } catch (error) {
    console.log(error.message);
    res.status(500).send('Server Error');
  }
});

//  @route  GET api/profile/github/:username
//  @desc   get user repos from Github
//  @access Public
router.get('/github/:username', async (req, res) => {
  try {
    const githubUserIdOptions = {
      uri: `https://api.github.com/users/${req.params.username}`,
      method: 'GET',
      headers: { 'user-agent': 'node.js' }
    };
    console.log('githubUserIdOptions: ', githubUserIdOptions);
    request(githubUserIdOptions, (error, response, body) => {
      if (response.statusCode !== 200) {
        return res.status(404).json({ msg: 'No Github profile found' });
      } else {
        let usrGithubId = JSON.parse(body).id;
        const options = {
          uri: `https://api.github.com/user/${usrGithubId}/repos`,
          method: 'GET',
          headers: { 'user-agent': 'node.js' }
        };

        request(options, (error, response, body) => {
          if (error) console.log(error);
          if (response.statusCode !== 200) {
            return res.status(404).json({ msg: 'No Github profile found' });
          }
          return res.json(JSON.parse(body));
        });
      }
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
