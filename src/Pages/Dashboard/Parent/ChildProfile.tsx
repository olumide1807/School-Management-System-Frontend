import ProfileView from "../Student/ProfileView";
import ChildPage, { firstNameOf } from "./ChildPage";

// The frame already fetched ["child-profile", childId]; this page just
// renders it. `guardians` is not in the payload, so other guardians are
// never shown — only this parent's own relationship.
export default function ChildProfile() {
  return (
    <ChildPage>
      {({ profile }) => (
        <ProfileView
          student={profile.child}
          classArm={profile.classArm}
          childName={firstNameOf(profile.child)}
          relationship={profile.relationship}
        />
      )}
    </ChildPage>
  );
}
