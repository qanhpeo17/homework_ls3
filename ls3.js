import express from 'express';
import { v4 as uuidv4 } from 'uuid';
const app = express();
app.use(express.json());

app.get('', (req, res) => {
    res.send({
        message: 'Hello'
    });
});
//bai1
app.post('/users', async (req, res) => {
    try {
        const { userName, email, age } = req.body;
        if (!userName || !email) {
            return res.status(404).send({
                error: "Username and email are required"
            });
        }

        const drawEmail = await fetch(`http://localhost:3031/users?email=${email}`);
        const emailExist = await drawEmail.json();

        const drawUserName = await fetch(`http://localhost:3031/users?userName=${userName}`);
        const userNameExist = await drawUserName.json();

        if (emailExist.length > 0 || userNameExist.length > 0) {
            return res.status(400).send("User already exists");
        }

        const newUser = {
            id: uuidv4(),
            userName,
            email,
            age: age || "",
            avatar: ""
        };

        const response = await fetch("http://localhost:3031/users", {
            method: "POST",
            headers: {
                "Content-type": "application/json"
            },
            body: JSON.stringify(newUser)
        });

        const createdUser = await response.json();

        res.status(201).send({
            message: "User created successfully",
            user: createdUser,
        });
    } catch (err) {
        res.status(500).send({
            message: "Server error: " + err.message,
            data: null,
        });
    }
});
//bai2
app.post('/posts', async (req, res) => {
    try {
        const { userID, content, isPublic } = req.body;
        if (!content || !isPublic) {
            return res.status(404).send({
                message: "Content and public status are required"
            });
        }

        const newPost = {
            id: uuidv4(),
            userID,
            content,
            isPublic,
            createdAt: new Date().toISOString()
        };

        const response = await fetch("http://localhost:3031/posts", {
            method: "POST",
            headers: {
                "Content-type": "application/json"
            },
            body: JSON.stringify(newPost)
        });

        const createdPost = await response.json();

        res.status(201).send({
            message: "Post created successfully",
            post: createdPost
        });

    } catch (error) {
        res.status(500).send({
            message: "Server error: " + error.message,
            data: null
        });
    }
});
//bai3 
app.put('/posts/:id', async (req, res) => {
    try {
        const postId = req.params.id;
        const { userId, content, isPublic } = req.body;

        const drawPost = await fetch(`http://localhost:3031/posts?id=${postId}`);
        const post = await drawPost.json();

        if (post.length === 0) {
            return res.status(404).send({
                message: "Ko tim thay bai viet"
            });
        }

        const postToUpdate = post[0];

        if (postToUpdate.userId !== userId) {
            return res.status(403).send({
                message: "Ban ko co quyen chinh sua bai viet nay"
            });
        }

        const updatedPost = {
            ...postToUpdate,
            content: content || postToUpdate.content,
            isPublic: typeof isPublic === 'boolean' ? isPublic : postToUpdate.isPublic,
            updatedAt: new Date().toISOString() 
        };

        const response = await fetch(`http://localhost:3031/posts/${postId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedPost)
        });

        const updatedPostData = await response.json();

        res.status(200).send({
            message: "Bai viet chinh sua thanh cong",
            post: updatedPostData
        });
    } catch (error) {
        res.status(500).send({
            message: "Server error: " + error.message,
            data: null
        });
    }
});

//bai 4
app.post("/comments", async (req, res) => {
    try {
        const { postId, userId, content } = req.body;
        if (!postId || !userId || !content) {
            return res.status(404).send({
                message: "Missing required fields"
            });
        }

        const drawPostID = await fetch(`http://localhost:3031/posts?id=${postId}`);
        const postIdExists = await drawPostID.json();

        const drawUserID = await fetch(`http://localhost:3031/users?id=${userId}`);
        const userIdExists = await drawUserID.json();

        if (postIdExists.length === 0 || userIdExists.length === 0) {
            return res.status(404).send({
                message: "Invalid post or user ID",
                data: null
            });
        }

        const newCmt = {
            id: uuidv4(),
            postId,
            createdAt: new Date().toISOString(),
            userId,
            content
        };

        const response = await fetch("http://localhost:3031/comments", {
            method: "POST",
            headers: {
                "Content-type": "application/json"
            },
            body: JSON.stringify(newCmt)
        });

        const createdComment = await response.json();

        res.status(201).send({
            message: "Comment created successfully",
            comment: createdComment
        });
    } catch (error) {
        res.status(500).send({
            message: "Server error: " + error.message,
            data: null
        });
    }
});
//bai5
app.put('/comments/:id', async (req, res) => {
    try {
        const commentId = req.params.id;
        const { userId, content } = req.body;

        const drawComment = await fetch(`http://localhost:3031/comments?id=${commentId}`);
        const comment = await drawComment.json();

        if (comment.length === 0) {
            return res.status(404).send({
                message: "Ko tim thay binh luan"
            });
        }

        const commentToUpdate = comment[0];

        if (commentToUpdate.userId !== userId) {
            return res.status(403).send({
                message: "Ban ko co quyen chinh sua binh luan nay"
            });
        }

        const updatedComment = {
            ...commentToUpdate,
            content: content || commentToUpdate.content,
            updatedAt: new Date().toISOString() 
        };

        const response = await fetch(`http://localhost:3031/comments/${commentId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedComment)
        });

        const updatedCommentData = await response.json();

        res.status(200).send({
            message: "comment updated successfully",
            comment: updatedCommentData
        });
    } catch (error) {
        res.status(500).send({
            message: "server error: " + error.message,
            data: null
        });
    }
});
//bai6 va bai8
app.get('/posts/:postId/comments', async (req, res) => {
    try {
        const postId = req.params.postId;

        const response = await fetch(`http://localhost:3031/comments?postId=${postId}`);

        if (!response.ok) {
            return res.status(response.status).send({
                message: `Error: ${response.statusText}`
            });
        }

        const comments = await response.json();

        if (comments.length === 0) {
            return res.status(404).send({
                message: "No comments found for this post"
            });
        }

        res.status(200).send({
            message: "Comments retrieved successfully",
            comments: comments
        });
    } catch (error) {
        res.status(500).send({
            message: "Server error: " + error.message,
            data: null
        });
    }
});
//bai7
app.get('/posts-topthree-comments', async (req, res) => {
    try {
        const postsResponse = await fetch('http://localhost:3031/posts');
        
        if (!postsResponse.ok) {
            return res.status(postsResponse.status).send({
                message: `Error fetching posts: ${postsResponse.statusText}`
            });
        }

        const posts = await postsResponse.json();

        const postsWithComments = await Promise.all(posts.map(async (post) => {
            const commentsResponse = await fetch(`http://localhost:3031/comments?postId=${post.id}`);

            if (!commentsResponse.ok) {
                return res.status(commentsResponse.status).send({
                    message: `Error fetching comments: ${commentsResponse.statusText}`
                });
            }

            const comments = await commentsResponse.json();

            const topThreeComments = comments.slice(0, 3);

            return {
                ...post,
                comments: topThreeComments
            };
        }));

        res.status(200).send({
            message: 'Posts with top 3 comments retrieved successfully',
            posts: postsWithComments
        });
    } catch (error) {
        res.status(500).send({
            message: 'Server error: ' + error.message,
            data: null
        });
    }
});



//
app.listen(8080, () => {
    console.log("Server is running on port 8080");
});
