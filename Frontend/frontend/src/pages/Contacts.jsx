import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { API, useAuth } from "@/App";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  Users, 
  Plus, 
  Phone, 
  Mail, 
  Heart, 
  Pencil, 
  Trash2,
  MessageSquare,
  Bell
} from "lucide-react";

const RELATIONSHIPS = [
  { value: "spouse", label: "Spouse" },
  { value: "parent", label: "Parent" },
  { value: "child", label: "Child" },
  { value: "sibling", label: "Sibling" },
  { value: "friend", label: "Friend" },
  { value: "caregiver", label: "Caregiver" },
  { value: "doctor", label: "Doctor" },
  { value: "other", label: "Other" },
];

export default function Contacts() {
  const { user } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    relationship: "other",
    notify_sms: true,
    notify_email: true,
    notify_push: true,
  });

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const response = await axios.get(`${API}/contacts`, {
        withCredentials: true,
      });
      setContacts(response.data);
    } catch (error) {
      toast.error("Failed to load contacts");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name) {
      toast.error("Name is required");
      return;
    }

    if (!formData.phone && !formData.email) {
      toast.error("At least one contact method (phone or email) is required");
      return;
    }

    try {
      if (editingContact) {
        await axios.put(
          `${API}/contacts/${editingContact.contact_id}`,
          formData,
          { withCredentials: true }
        );
        toast.success("Contact updated");
      } else {
        await axios.post(`${API}/contacts`, formData, {
          withCredentials: true,
        });
        toast.success("Contact added");
      }
      
      fetchContacts();
      closeDialog();
    } catch (error) {
      toast.error("Failed to save contact");
    }
  };

  const handleDelete = async (contactId) => {
    try {
      await axios.delete(`${API}/contacts/${contactId}`, {
        withCredentials: true,
      });
      toast.success("Contact deleted");
      fetchContacts();
    } catch (error) {
      toast.error("Failed to delete contact");
    }
  };

  const openEditDialog = (contact) => {
    setEditingContact(contact);
    setFormData({
      name: contact.name,
      phone: contact.phone || "",
      email: contact.email || "",
      relationship: contact.relationship || "other",
      notify_sms: contact.notify_sms ?? true,
      notify_email: contact.notify_email ?? true,
      notify_push: contact.notify_push ?? true,
    });
    setIsDialogOpen(true);
  };

  const openNewDialog = () => {
    setEditingContact(null);
    setFormData({
      name: "",
      phone: "",
      email: "",
      relationship: "other",
      notify_sms: true,
      notify_email: true,
      notify_push: true,
    });
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingContact(null);
    setFormData({
      name: "",
      phone: "",
      email: "",
      relationship: "other",
      notify_sms: true,
      notify_email: true,
      notify_push: true,
    });
  };

  const getRelationshipLabel = (value) => {
    return RELATIONSHIPS.find((r) => r.value === value)?.label || value;
  };

  return (
    <Layout>
      <div data-testid="contacts-page" className="space-y-6 pb-20 md:pb-0">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Emergency Contacts
            </h1>
            <p className="text-muted-foreground">
              People who will be notified in an emergency
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="add-contact-btn" onClick={openNewDialog}>
                <Plus className="w-4 h-4 mr-2" />
                Add Contact
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>
                    {editingContact ? "Edit Contact" : "Add Emergency Contact"}
                  </DialogTitle>
                  <DialogDescription>
                    This person will receive alerts when an emergency is detected.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      data-testid="contact-name-input"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      data-testid="contact-phone-input"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      placeholder="+1234567890"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      data-testid="contact-email-input"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder="john@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="relationship">Relationship</Label>
                    <Select
                      value={formData.relationship}
                      onValueChange={(value) =>
                        setFormData({ ...formData, relationship: value })
                      }
                    >
                      <SelectTrigger data-testid="contact-relationship-select">
                        <SelectValue placeholder="Select relationship" />
                      </SelectTrigger>
                      <SelectContent>
                        {RELATIONSHIPS.map((rel) => (
                          <SelectItem key={rel.value} value={rel.value}>
                            {rel.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3 pt-2">
                    <Label className="text-sm font-medium">Notification Preferences</Label>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">SMS Alerts</span>
                      </div>
                      <Switch
                        checked={formData.notify_sms}
                        onCheckedChange={(checked) =>
                          setFormData({ ...formData, notify_sms: checked })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">Email Alerts</span>
                      </div>
                      <Switch
                        checked={formData.notify_email}
                        onCheckedChange={(checked) =>
                          setFormData({ ...formData, notify_email: checked })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">Push Notifications</span>
                      </div>
                      <Switch
                        checked={formData.notify_push}
                        onCheckedChange={(checked) =>
                          setFormData({ ...formData, notify_push: checked })
                        }
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={closeDialog}>
                    Cancel
                  </Button>
                  <Button type="submit" data-testid="save-contact-btn">
                    {editingContact ? "Update" : "Add"} Contact
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Contacts Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-6 bg-muted rounded w-1/2 mb-4" />
                  <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-4 bg-muted rounded w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : contacts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {contacts.map((contact) => (
              <Card
                key={contact.contact_id}
                data-testid={`contact-card-${contact.contact_id}`}
                className="contact-card"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {contact.name}
                        </h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          {getRelationshipLabel(contact.relationship)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    {contact.phone && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="w-4 h-4" />
                        <span>{contact.phone}</span>
                      </div>
                    )}
                    {contact.email && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="w-4 h-4" />
                        <span className="truncate">{contact.email}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    {contact.notify_sms && (
                      <span className="px-2 py-1 bg-muted text-xs rounded-full flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" /> SMS
                      </span>
                    )}
                    {contact.notify_email && (
                      <span className="px-2 py-1 bg-muted text-xs rounded-full flex items-center gap-1">
                        <Mail className="w-3 h-3" /> Email
                      </span>
                    )}
                    {contact.notify_push && (
                      <span className="px-2 py-1 bg-muted text-xs rounded-full flex items-center gap-1">
                        <Bell className="w-3 h-3" /> Push
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => openEditDialog(contact)}
                      data-testid={`edit-contact-${contact.contact_id}`}
                    >
                      <Pencil className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                          data-testid={`delete-contact-${contact.contact_id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Contact</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to remove {contact.name} from your
                            emergency contacts? They will no longer receive alerts.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(contact.contact_id)}
                            className="bg-red-500 hover:bg-red-600"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <Users className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Emergency Contacts</h3>
              <p className="text-muted-foreground mb-4">
                Add your first emergency contact to get started.
              </p>
              <Button onClick={openNewDialog}>
                <Plus className="w-4 h-4 mr-2" />
                Add Contact
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
