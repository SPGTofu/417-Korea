import { FIREBASE_DB, FIREBASE_STORAGE } from "../FirebaseConfig";
import { addDoc, arrayRemove, arrayUnion, collection, deleteDoc, doc, getDoc, getDocs, onSnapshot, query, setDoc, where } from "firebase/firestore";
import { deleteFolderInBusinessEditImages, deletePendingImagesOfBusinessInStorage, deletePublishedImagesOfBusinessInStorage, getPublishedImageFromStorage, movePendingImageToPublishedImage, removePublishedImageIfNotInURLArray, returnArrayOfImageNamesInOrderGiven, returnArrayOfImagesNotInPublishedImageOfBusiness, uploadBusinessEditImage, uploadPendingImageToStorage, uploadPublishedImageToStorage, uploadingPublishedImageToStorage } from "./storagecalls";
import { getBlob, ref } from "firebase/storage";
import { deleteUser } from "firebase/auth";

/* create a document with the business' 
name, description, phone number, and address */
export const addBusinessWithData = async (name, description, phoneNumber, address) => {
    try {
        const businessCollectionRef = collection(FIREBASE_DB, "database");
        await addDoc(businessCollectionRef, {
            name: name,
            description: description,
            phonenumber: phoneNumber,
            address: address
        });
        return CREATION_SUCCESS;
    }
    catch (error) {
        return error;
    }
}

// get the user's name from the database
export const getUserNameFromDatabase = async (user) => {
    try {
        const userCollectionRef = collection(FIREBASE_DB, "users");
        const userDocRef = doc(userCollectionRef, user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
            return userDoc.data().userName;
        } else {
            throw new Error("user does not exist");
        }
    } catch(error) {
        console.error("Error getting username: ", error);
        return null;
    }
}

// create a document in businessRequests to await approval for a publish 
// also upload images to firebase storage
export const createBusinessRequest = async (businessData, user) => {
    try {
        // setup doc to get the ID of it for naming purposes
        const businessRequestCollectionRef = collection(FIREBASE_DB, "businessRequests");
        const docRef = await addDoc(businessRequestCollectionRef, {});
        const docID = docRef.id

        let arrayOfPhotoNames = [];
        let publisher = {
            email: "",
            userName: "",
        }
        // set submitter: 
        const submitter = {
            userName: await getUserNameFromDatabase(user),
            email: user.email
        };

        // set publisher
        if (businessData.isOwner) {
            publisher = submitter;
        };

        // upload each image to storage
        for (let i = 0; i < businessData.imageUriArray.length; i++) {
            const imageFilePath = docID;
            const imageNameString = `${imageFilePath}_${i}`;
            try {
                await uploadPendingImageToStorage(
                    imageFilePath, 
                    imageNameString, 
                    businessData.imageUriArray[i].uri
                );
            } catch(error) {
                console.error('dbcall78: ', error);
                return error;
            }
            arrayOfPhotoNames.push(imageNameString);
        };

        // add business to pending businesses
        await setDoc(docRef, {
            name: businessData.businessName,
            description: businessData.businessDescription,
            phonenumber: businessData.businessPhoneNumber,
            photos: [...arrayOfPhotoNames],
            address: businessData.businessAddress,
            businessWebsiteInfo: businessData.businessWebsite,
            instagramInfo: businessData.instagram,
            yelpInfo: businessData.yelp,
            facebookInfo: businessData.facebook,
            hours: businessData.hours,
            hoursDescription: businessData.hoursDescription,
            submitter: submitter,
            publisher: publisher,
            type: businessData.type
        });
        console.log('done: ', docID);
    }
    catch (error) {
        console.error(error);
        return error;
    }
}

// checks if user is an admin
export const checkIfUserIsAdmin = async (user) => {
    try {
        if (user.uid == null) { 
            console.error("No user found");
            return false;
        }
        const uid = user.uid;
        console.log(uid);
        const userDocRef = doc(FIREBASE_DB, "users", user.uid);
        console.log('2');
        const userDoc = await getDoc(userDocRef);
        console.log(userDoc);
        if (userDoc.exists()) {
            return userDoc.data().roles.includes("admin");
        } else {
            console.error('admin: userDoc does not exist');
            return false;
        }
    }
    catch (error) {
        console.error("Error checking for admin: ", error);
        return false;
    }
}

// return collection of business requests from db
export const returnBusinessRequestCollectionRef = () => {
    const returnCollection = collection(FIREBASE_DB, "businessRequests");
    return returnCollection;
}

// return listener to collection of pending business requests
export const subscribeToPendingBusinesses = (setArrayOfPendingBusinesses) => {
    try {
        const collectionRef = collection(FIREBASE_DB, "businessRequests");
        const businessQuery = query(collectionRef, where("name", "!=", ""));
        const unsub = onSnapshot(businessQuery, (snapshot) => {
                const tempArrayOfPendingBusinesses = [];
                snapshot.forEach((doc) => {
                    tempArrayOfPendingBusinesses.push({
                        name: doc.data().name,
                        phoneNumber: doc.data().phonenumber,
                        photos: doc.data().photos,
                        address: doc.data().address,
                        description: doc.data().description, 
                        publisher: doc.data().publisher,
                        businessWebsiteInfo: doc.data().businessWebsiteInfo,
                        facebookInfo: doc.data().facebookInfo,
                        instagramInfo: doc.data().instagramInfo,
                        yelpInfo: doc.data().yelpInfo,
                        hours: doc.data().hours,
                        hoursDescription: doc.data().hoursDescription,
                        type: doc.data().type,
                        docID: doc.id 
                    });
                });
                setArrayOfPendingBusinesses(tempArrayOfPendingBusinesses);
            })
            return unsub;
     }
     catch(error) {
        console.error('error returning query of business requests: ', error);
        return[];
     }
}

// update business with edits made
export const updatePublishedBusinessDataWithEdits = async (businessData) => {
    try {
        // checks if any current images were removed from the edited business
        await removePublishedImageIfNotInURLArray(businessData.photos, businessData.docID);

        // upload array of image and return array of its file names in order
        const arrayOfImageNames = await returnArrayOfImageNamesInOrderGiven(
            businessData.photos, 
            businessData.docID
        );
        console.log('updated current images: ', arrayOfImageNames);
        
        // update doc
        const pubDocRef = doc(FIREBASE_DB, 'database', businessData.docID);
        await setDoc(pubDocRef, {
            name: businessData.name,
            tags: businessData.tags,
            phoneNumber: businessData.number,
            businessWebsiteInfo: businessData.businessWebsite,
            instagramInfo: businessData.instagram,
            facebookInfo: businessData.facebook,
            yelpInfo: businessData.yelp,
            description: businessData.description,
            hours: businessData.hours,
            address: businessData.address,
            publisher: businessData.publisher,
            photos: [...arrayOfImageNames],
            type: businessData.type,
            docID: businessData.docID
        })
        console.log('doc edit successful');
        
    } catch (error) {
        console.error('dbcall 202: ', error);
    }
}

// sends business into database
export const sendBusinessDataToDatabase = async (businessData) => {
    try {
        // add doc to database
        const databaseCollectionRef = collection(FIREBASE_DB, "database");
        const pubDocRef = doc(databaseCollectionRef, businessData.docID);
        await setDoc(pubDocRef, {
            name: businessData.name,
            tags: businessData.tags,
            phoneNumber: businessData.phoneNumber,
            businessWebsiteInfo: businessData.businessWebsiteInfo,
            instagramInfo: businessData.instagramInfo,
            facebookInfo: businessData.facebookInfo,
            yelpInfo: businessData.yelpInfo,
            description: businessData.description,
            hours: businessData.hours,
            address: businessData.address,
            publisher: businessData.publisher,
            photos: businessData.photoNames,
            type: businessData.type,
            docID: businessData.docID
        });
        console.log('doc addition successful');

        // remove doc from pending businesses
        const businessRequestsCollectionRef = collection(FIREBASE_DB, "businessRequests");
        const docRef = doc(businessRequestsCollectionRef, businessData.docID);
        const docSnapshot = await getDoc(docRef);

        if (!docSnapshot.exists()) {
            console.error("No documents found");
            return;
        }
        await deleteDoc(docRef);
        console.log('doc deletion successful');
        
        // add images to published images and removes from pending images
        for (let i = 0; i < businessData.photos.length; i++) {
            const imageFilePath = businessData.docID;
            const imageNameString = `${imageFilePath}_${i}`;
            await movePendingImageToPublishedImage(imageFilePath, imageNameString);
        }
    } catch(error) {
        console.error('dbcall 249: ', error);
        return null;
    }
}

// gets business by its name
export const getPublishedBusinessByID = async (documentID) => {
    try {
        console.log("documentID: ", documentID)
        const databaseCollectionRef = collection(FIREBASE_DB, "database");
        const docRef = doc(databaseCollectionRef, documentID);
        const snapshot = await getDoc(docRef);
    
        if (snapshot.exists()) {
            // retreive images
            const photos = await Promise.all(
                snapshot.data().photos.map((photoName) => {
                    return getPublishedImageFromStorage(documentID, photoName)}
                )
            );

            return {
                ...snapshot.data(), 
                docID: documentID,
                photos: photos
            };

        } else {
            console.error('document not found');
            return null;
        }
    } catch (error) {
        console.error('dbcall280: ', error);
        return null;
    }
}


// gets a user's current saved list of businesses
export const getSavedBusinessesOfUser = async (user) => {
    try {
        const userCollectionRef = collection(FIREBASE_DB, "users");
        const userDocRef = doc(userCollectionRef, user.uid);
        const userDoc = await getDoc(userDocRef);
        
        // checks if user even exists
        if (userDoc.exists()) {
            let arrayOfSavedBusinesses = await Promise.all(
                userDoc.data().saved.map((business) => {
                    return getPublishedBusinessByID(business)}
                )
            );
            return arrayOfSavedBusinesses;
        } else {
            console.error('saved: userDoc does not exist');
            return [];
        }
    } catch (error) {
        console.error('dbcall306: ', error);
        return [];
    }    
}

// creatse a business edit request and stores images if needed. 
// input data should hold business's name and address and user's descritpion and images
export const createBusinessEditRequest = async (business, inputData, user) => {
    try {
        // Create business ref and get ID
        const businessEditRequestRef = collection(FIREBASE_DB, "businessEditRequests");
        const docRef = await addDoc(businessEditRequestRef, {});
        const docID = docRef.id;

        // define editor
        const editorName = await getUserNameFromDatabase(user);
        const editor = {
            userName: editorName,
            email: user.email
        }

        //define image names
        const arrayOfImageNames = [];
        for (let i = 0; i < inputData.images.length; i++) {
            const filePath = docID;
            const imageName = `${filePath}_${i}`;
            arrayOfImageNames.push(imageName);
            await uploadBusinessEditImage(filePath, imageName, inputData.images[i]);
        };

        // Store busienssID, edit/suggestion, editor, and images
        await setDoc(docRef, {
            businessID: business.docID,
            editDescription: inputData.description,
            images: arrayOfImageNames,
            publisher: editor
        });

    } catch (error) {
        console.error('dbcall345: ', error);
    }
}

// fetches all business edit requests
export const getBusinessEditRequests = async () => {
    try {
        const businessEditRequestCollection = collection(FIREBASE_DB, "businessEditRequests");
        const requestQuery = query(businessEditRequestCollection);
        const snapshot = await getDocs(requestQuery);

        const editRequests = snapshot.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id
        }))

        return editRequests;
    } catch (error) {
        console.error('dbcall363: ', error);
    }
}

// fetch business name by ID
export const getBusinessNameFromDatabaseUsingID = async (businessID) => {
    try {
        const businessRef = doc(FIREBASE_DB, "database", businessID);
        const businessDoc = await getDoc(businessRef);
        return businessDoc.data().name;
    } catch (error) {
        console.error('dbcall374: ', error);
    }
}

// remove business from edit business request collection
export const removeBusinessEditRequestByID = async (requestID) => {
    try {
        const businessDoc = doc(FIREBASE_DB, "businessEditRequests", requestID);
        await deleteDoc(businessDoc);
        await deleteFolderInBusinessEditImages(requestID);

    } catch (error) {
        console.error('dbcall396: ', error);
    }
}

// remove new business request by its ID
export const removeBusinessRequestByID = async (businessID) => {
    try {
        const businessRequestRef = doc(FIREBASE_DB, "businessRequests", businessID);
        await deleteDoc(businessRequestRef);
        await deletePendingImagesOfBusinessInStorage(businessID);
    } catch (error) {
        console.error('Error removing business request: ', error);
    }
}

// returns array of businesses based on their business type
export const getPublishedBusinessesByType = async (type) => {
    try {
        const databaseCollectionRef = collection(FIREBASE_DB, 'database');
        const businessesQuery = query(databaseCollectionRef, where('type', '==', type));
        const snapshot = await getDocs(businessesQuery);

        const returnArray = await Promise.all(
            snapshot.docs.map(async (doc) => {
                const firstImage = await getPublishedImageFromStorage(doc.data().docID, doc.data().photos[0]);
                return ({
                    name: doc.data().name,
                    firstImage: firstImage,
                    docID: doc.data().docID    
                })
            })
        )
        return returnArray;
    } catch (error) {
        console.error('Error geting businesses by type: ', error);
        return [];
    }
}

// Check if user has the business saved
export const checkIfUserHasBusinessInSaved = async (user, businessID) => {
    if (user == null) return false;
    try {
        const userDocRef = doc(FIREBASE_DB, 'users', user.uid? user.uid : "");
        const userDoc = await getDoc(userDocRef);
        const saved = userDoc.data().saved;
        return saved.includes(businessID);
    } catch (error) {
        console.error('error checking if business is saved: ', error);
        return false;
    }
}

// Add business to saved
export const addBusinessIDToSavedList = async (user, businessID) => {
    if (user == null) return null;
    try {
        console.log('adding: ', businessID);
        const userDocRef = doc(FIREBASE_DB, 'users', user.uid);
        setDoc(userDocRef,
            {saved: arrayUnion(businessID)},
            {merge: true}
        );
    } catch (error) {
        console.error('error adding business to saved: ', error);
    }
}

// Remove business from saved
export const removeBusinessIDFromSavedList = async (user, businessID) => {
    if (user == null) return false;
    try {
        console.log('removing: ', businessID);
        const userDocRef = doc(FIREBASE_DB, 'users', user.uid);
        setDoc(userDocRef,
            {saved: arrayRemove(businessID)},
            {merge: true}
        );
    } catch (error) {
        console.error('error removing business from saved: ', error);
    }
}

// delete user in auth and user doc in firebase
export const deleteUserAndUserDocFromDB = async (user) => {
    const uid = user?.uid;
    const userDoc = doc(FIREBASE_DB, "users", uid);

    // check if user, user auth, and user doc exist
    if (user && uid != null && userDoc != null) {
        deleteUser(user).then(async () => {
            console.log(`${uid} has been removed from the database`);
            //delete user doc
            try {
                await deleteDoc(userDoc);
                console.log(`${uid} doc has been removed`)
            } catch (error) {
                console.error (`error deleting userDoc for ${uid}: ${error}`);
            }
          }).catch((error) => {
            console.error(`error removing user ${uid}: ${error}`)
          }); 
    }     
}