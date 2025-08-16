import { v4 as uuidv4 } from "uuid";

export const generateVerificationToken = () => {
  return uuidv4().replace(/-/g, "").slice(0, 24); 
};


export const storeVerificationToken = async (nhost, email, token) => {
  try {
    console.log("[DEBUG] Storing token for:", { email, token });
    console.log("[DEBUG] User authenticated:", nhost.auth.isAuthenticated());
    console.log("[DEBUG] User ID:", nhost.auth.getUser()?.id);
    
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); 
    
   
    const userId = nhost.auth.getUser()?.id;
    if (!userId) {
      console.error("[DEBUG] No user ID available");
      return { success: false, error: "User not authenticated properly" };
    }
    
    const mutation = `
      mutation InsertEmailVerification($object: email_verifications_insert_input!) {
        insert_email_verifications_one(object: $object) {
          id
          email
          token
          verified
          user_id
        }
      }
    `;

    const variables = {
      object: {
        email,
        token,
        expires_at: expiresAt.toISOString(),
        verified: false,
        user_id: userId, 
      },
    };

    console.log("[DEBUG] Attempting mutation with explicit user_id:", variables);
    const { data, error } = await nhost.graphql.request(mutation, variables);

    if (error) {
      console.error("[DEBUG] GraphQL Insert Error:", error);
      console.error("[DEBUG] Error details:", JSON.stringify(error, null, 2));
      
      
      console.log("[DEBUG] Trying without explicit user_id...");
      
      const simpleVariables = {
        object: {
          email,
          token,
          expires_at: expiresAt.toISOString(),
          verified: false,
        },
      };
      
      const simpleResult = await nhost.graphql.request(mutation, simpleVariables);
      
      if (simpleResult.error) {
        console.error("[DEBUG] Simple mutation also failed:", simpleResult.error);
        
        
        console.log("[DEBUG] Trying bulk insert as final fallback...");
        
        const bulkMutation = `
          mutation InsertEmailVerificationBulk($objects: [email_verifications_insert_input!]!) {
            insert_email_verifications(objects: $objects) {
              returning {
                id
                email
                token
                verified
                user_id
              }
            }
          }
        `;
        
        const bulkResult = await nhost.graphql.request(bulkMutation, {
          objects: [simpleVariables.object]
        });
        
        if (bulkResult.error) {
          console.error("[DEBUG] All mutation attempts failed:", bulkResult.error);
          return { success: false, error: bulkResult.error };
        }
        
        console.log("[DEBUG] Bulk insert successful:", bulkResult.data);
        return { success: true, result: bulkResult.data };
      }
      
      console.log("[DEBUG] Simple mutation successful:", simpleResult.data);
      return { success: true, result: simpleResult.data };
    }
    
    console.log("[DEBUG] Token stored successfully:", data);
    return { success: true, result: data };
  } catch (err) {
    console.error("[DEBUG] Store token catch error:", err);
    console.error("[DEBUG] Error details:", JSON.stringify(err, null, 2));
    return { success: false, error: err };
  }
};

export const sendVerificationEmail = async (email, token) => {
  try {
    const verifyUrl = `${window.location.origin}/verify-email?email=${encodeURIComponent(email)}&token=${token}`;
    console.log("[DEBUG] Verification URL:", verifyUrl);
    
    
    alert(`✅ Verification Email (TEST MODE)\n\n` +
          `Email: ${email}\n\n` +
          `Click this link to verify your account:\n${verifyUrl}\n\n` +
          `(Copy the link and paste it in your browser)`);
    
    return { success: true };
  } catch (err) {
    console.error("[DEBUG] Send email error:", err);
    return { success: false, error: err };
  }
};

// 4. Verify email token
export const verifyEmailToken = async (nhost, email, token) => {
  try {
    console.log("[DEBUG] Starting email verification for:", { email, token });
    
    const query = `
      query VerifyEmailToken($email: String!, $token: String!) {
        email_verifications(
          where: {
            email: {_eq: $email},
            token: {_eq: $token},
            verified: {_eq: false},
            expires_at: {_gt: "now()"}
          }
          limit: 1
        ) {
          id
          user_id
          expires_at
          verified
        }
      }
    `;

    console.log("[DEBUG] Running verification query...");
    const { data, error } = await nhost.graphql.request(query, { email, token });
    
    if (error) {
      console.error("[DEBUG] Verify query error:", error);
      return { success: false, error };
    }

    console.log("[DEBUG] Query result:", data);

    if (!data?.email_verifications?.length) {
      console.log("[DEBUG] No matching verification record found");
      return { success: false, error: "Invalid or expired token" };
    }

    const { id, user_id } = data.email_verifications[0];
    console.log("[DEBUG] Found verification record:", { id, user_id });

    const mutation = `
      mutation VerifyEmail($id: uuid!, $userId: uuid!) {
        update_email_verifications_by_pk(
          pk_columns: {id: $id},
          _set: {verified: true}
        ) {
          id
          verified
        }
        update_users_by_pk(
          pk_columns: {id: $userId},
          _set: {emailVerified: true}
        ) {
          id
          emailVerified
        }
      }
    `;

    console.log("[DEBUG] Updating verification status...");
    const updateRes = await nhost.graphql.request(mutation, { id, userId: user_id });
    
    if (updateRes.error) {
      console.error("[DEBUG] Update error:", updateRes.error);
      return { success: false, error: updateRes.error };
    }

    console.log("[DEBUG] Email verified successfully:", updateRes.data);
    
    try {
      await nhost.auth.refreshSession();
      console.log("[DEBUG] Session refreshed successfully");
    } catch (refreshError) {
      console.warn("[DEBUG] Session refresh failed (non-critical):", refreshError);
    }
    
    return { success: true, verified: true };
  } catch (err) {
    console.error("[DEBUG] Verify token catch error:", err);
    return { success: false, error: err };
  }
};